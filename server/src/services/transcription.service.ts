import { protos, SpeechClient } from '@google-cloud/speech';
import { Storage } from '@google-cloud/storage';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errors.js';
import { StatusCodes } from 'http-status-codes';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { unlink } from 'fs/promises';

export interface TranscriptionResult {
  text: string;
  confidence: number;
  isMusic?: boolean;
}

export class TranscriptionService {
  private static readonly BUCKET_NAME = 'ai-video-summarizer-audio';
  private static readonly speechClient = new SpeechClient();
  private static readonly storage = new Storage();

  static async ensureBucketExists() {
    try {
      const [exists] = await this.storage.bucket(this.BUCKET_NAME).exists();

      if (!exists) {
        await this.storage.createBucket(this.BUCKET_NAME, {
          location: 'US',
          storageClass: 'STANDARD',
        });
        logger.info(`Bucket ${this.BUCKET_NAME} created`);
      }
    } catch (error) {
      logger.error(`Error creating bucket ${this.BUCKET_NAME}`, { error });
      throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create bucket');
    }
  }

  static async uploadToGCS(filePath: string): Promise<string> {
    const fileName = path.basename(filePath);
    const bucket = this.storage.bucket(this.BUCKET_NAME);

    try {
      await bucket.upload(filePath, {
        destination: fileName,
        metadata: {
          contentType: 'audio/wav',
        },
      });

      const gcsUrl = `gs://${this.BUCKET_NAME}/${fileName}`;
      logger.info(`Audio uploaded to GCS: ${gcsUrl}`);
      return gcsUrl;
    } catch (error) {
      logger.error(`Error uploading audio to GCS: ${error}`);
      throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to upload audio to GCS');
    }
  }
  static async deleteFromGCS(gcsUrl: string): Promise<void> {
    try {
      const prefix = `gs://${this.BUCKET_NAME}/`;
      if (!gcsUrl.startsWith(prefix)) {
        logger.error(`Invalid GCS URL: ${gcsUrl}`);
        return;
      }

      const fileName = gcsUrl.slice(prefix.length);

      const file = this.storage.bucket(this.BUCKET_NAME).file(fileName);
      const [exists] = await file.exists();

      if (exists) {
        await file.delete();
        logger.info(`Audio deleted from GCS: ${gcsUrl}`);
      }
    } catch (error) {
      logger.error(`Error deleting audio from GCS: ${error}`);
      throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete audio from GCS');
    }
  }

  static async convertToWav(inputPath: string): Promise<string> {
    const outputPath = path.join(
      path.dirname(inputPath),
      `${path.basename(inputPath, path.extname(inputPath))}.wav`,
    );

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('wav')
        .audioFilters([
          'aresample=resampler=soxr',
          'highpass=f=50',
          'lowpass=f=3000',
          'afftdn=nf=-25',
          'loudnorm=I=-16:LRA=11:TP=-1.5',
          'aformat=channel_layouts=mono',
        ])
        .on('end', () => {
          logger.info(`Audio converted to WAV: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (err) => {
          logger.error(`Error converting audio to WAV: ${err}`);
          reject(new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to convert audio to WAV'));
        })
        .save(outputPath);
    });
  }

  static async detectContentType(audioPath: string): Promise<'speech' | 'music'> {
    const analysisPath = path.join(
      path.dirname(audioPath),
      `${path.basename(audioPath, path.extname(audioPath))}_analysis.wav`,
    );

    return new Promise((resolve, reject) => {
      let musicScore = 0;
      let totalSamples = 0;

      ffmpeg(audioPath)
        .toFormat('wav')
        .audioFrequency(16000)
        .audioFilter(['silencedetect=n=-50dB:d=0.5', 'volumedetect'])
        .save(analysisPath)
        .on('stderr', (stderrLine: string) => {
          logger.info(`FFmpeg stderr: ${stderrLine}`);

          if (stderrLine.includes('silence_duration')) {
            musicScore -= 1;
            totalSamples += 1;
          }

          if (stderrLine.includes('max_volume')) {
            const match = stderrLine.match(/max_volume:\s*([-\d.]+)/);
            if (match?.[1]) {
              const maxVolume = parseFloat(match[1]);
              if (maxVolume > -5) {
                musicScore += 1;
              }
              totalSamples += 1;
            }
          }
        })
        .on('end', async () => {
          await unlink(analysisPath).catch(() => {});
          const ratio = totalSamples > 0 ? musicScore / totalSamples : 0;
          logger.info(`Music detection ratio: ${ratio}`);
          resolve(ratio > 0.5 ? 'music' : 'speech');
        })
        .on('error', async (err: Error) => {
          logger.error(`Error detecting content type: ${err}`);
          await unlink(analysisPath).catch(() => {});
          reject(new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to detect content type'));
        });
    });
  }

  static async transcribe(audioPath: string): Promise<TranscriptionResult> {
    let wavePath: string | undefined;
    let gcsUrl: string | undefined;

    try {
      if (!audioPath) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'No audio file provided');
      }

      await this.ensureBucketExists();
      wavePath = await this.convertToWav(audioPath);
      logger.info(`Converted audio to WAV: ${wavePath}`);

      const contentType = await this.detectContentType(wavePath);
      logger.info(`Detected content type: ${contentType}`);

      if (contentType === 'music') {
        return {
          text: '[MUSIC CONTENT DETECTED]',
          confidence: 1.0,
          isMusic: true,
        };
      }

      gcsUrl = await this.uploadToGCS(wavePath);
      logger.info(`Upload audio to GCS: ${gcsUrl}`);

      const request: protos.google.cloud.speech.v1.ILongRunningRecognizeRequest = {
        audio: {
          uri: gcsUrl,
        },
        config: {
          encoding: protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16,
          sampleRateHertz: 16000,
          languageCode: process.env.SPEECH_TO_TEXT_LANGUAGE || 'en-US',
          enableAutomaticPunctuation: true,
          model: 'default',
          useEnhanced: true,
          metadata: {
            interactionType: 'DICTATION',
            microphoneDistance: 'NEARFIELD',
          },
          enableWordTimeOffsets: true,
          enableWordConfidence: true,
          maxAlternatives: 1,
          profanityFilter: true,
          audioChannelCount: 1,
          enableSeparateRecognitionPerChannel: false,
          speechContexts: [
            {
              phrases: ['video', 'youtube', 'subscribe', 'like', 'comment'],
              boost: 20,
            },
          ],
        },
      };

      const [operation] = await this.speechClient.longRunningRecognize(request);
      const [response] = await operation.promise();
      logger.info(`Transcription resp: ${operation.name}`);

      if (!response.results || response.results.length === 0) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'No transcription results found');
      }

      const transcription = response.results
        .map((result) => result.alternatives?.[0]?.transcript || '')
        .join(' ');

      if (!transcription.trim()) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'No transcription results found');
      }

      const confidenceScores = response.results
        .map((result) => result.alternatives?.[0]?.confidence)
        .filter((score): score is number => typeof score === 'number');

      const confidence =
        confidenceScores.length > 0
          ? confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length
          : 0;

      return {
        text: transcription,
        confidence,
        isMusic: false,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Error transcribing audio: ${error}`);
      throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to transcribe audio');
    } finally {
      await Promise.all([
        wavePath ? unlink(wavePath).catch(() => {}) : Promise.resolve(),
        gcsUrl ? this.deleteFromGCS(gcsUrl).catch(() => {}) : Promise.resolve(),
      ]);
    }
  }
}
