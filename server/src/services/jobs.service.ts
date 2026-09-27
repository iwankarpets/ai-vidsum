import Queue from 'bull';
import { AppDataSource } from '../config/database.js';
import { Video } from '../entities/video.entity.js';
import { Transcription } from '../entities/transcription.entity.js';
import { Analysis } from '../entities/analysis.entity.js';
import { User } from '../entities/user.entity.js';
import { VideoService, type VideoInfo } from './video.service.js';
import { TranscriptionService } from './transcription.service.js';
import { unlink } from 'fs/promises';
import { AIService } from './ai.service.js';
import { AppError } from '../utils/errors.js';
import logger from '../utils/logger.js';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

interface TranscriptionJob {
  url: string;
  videoInfo?: VideoInfo;
  userId: string;
}

interface JobResult {
  videoInfo?: VideoInfo;
  transcription?: unknown;
  analysis?: unknown;
  status: string;
  error?: string;
  final?: boolean;
}

export class JobsService {
  private static transcriptionQueue: Queue.Queue<TranscriptionJob>;
  private static readonly videoRepository = AppDataSource.getRepository(Video);
  private static readonly transcriptRepository = AppDataSource.getRepository(Transcription);
  private static readonly analysisRepository = AppDataSource.getRepository(Analysis);
  private static readonly userRepository = AppDataSource.getRepository(User);

  // было: static async initialize() — убрали async, т.к. await внутри не было
  static initialize() {
    this.transcriptionQueue = new Queue<TranscriptionJob>('transcription', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 20000 },
        removeOnComplete: { age: 24 * 3600, count: 100 },
        removeOnFail: { age: 24 * 3600, count: 100 },
      },
    });
  }

  static async setupQueueHandlers() {
    // было: this.transcriptionQueue.process(async (job) => {...}); — добавили void
    void this.transcriptionQueue.process(async (job) => {
      const { url, userId } = job.data;
      let audioPath: string | undefined;
      let video: Video | null = null;

      try {
        video = await this.videoRepository.findOne({ where: { url } });
        if (!video) {
          video = new Video();
          video.url = url;
          video.status = 'processing';
          video.user = { id: userId } as Pick<User, 'id'> as User;
        }

        await job.progress(10);

        const videoInfo = job.data.videoInfo || (await VideoService.getVideoInfo(url));

        Object.assign(video, {
          title: videoInfo.title,
          description: videoInfo.description,
          author: videoInfo.author,
          duration: videoInfo.duration,
          thumbnail: videoInfo.thumbnail,
        });

        await this.videoRepository.save(video);
        await job.progress(20);

        audioPath = await VideoService.downloadAudio(url);
        await job.progress(40);

        const transcriptionResult = await TranscriptionService.transcribe(audioPath);

        let transcription = await this.transcriptRepository.findOne({
          where: { video: { id: video.id } },
        });

        if (transcription) {
          transcription.text = transcriptionResult.text;
          transcription.confidence = transcriptionResult.confidence;
          transcription.isMusic = transcriptionResult.isMusic || false;
          transcription.audioPath = audioPath;
        } else {
          transcription = new Transcription();
          transcription.video = video;
          transcription.text = transcriptionResult.text;
          transcription.confidence = transcriptionResult.confidence;
          transcription.isMusic = transcriptionResult.isMusic || false;
          transcription.audioPath = audioPath;
        }

        await this.transcriptRepository.save(transcription);

        if (audioPath) {
          await unlink(audioPath).catch(() => {});
        }

        await job.progress(70);

        if (transcriptionResult.isMusic) {
          video.status = 'completed';
          await this.videoRepository.save(video);
          return { videoInfo, transcription: transcriptionResult, status: 'completed' };
        }

        const analysisResult = await AIService.analyzeTranscription(
          transcriptionResult.text,
          videoInfo,
        );

        let analysis = await this.analysisRepository.findOne({
          where: { video: { id: video.id } },
        });

        if (analysis) {
          Object.assign(analysis, analysisResult);
        } else {
          analysis = new Analysis();
          Object.assign(analysis, analysisResult);
          analysis.video = video;
        }
        await this.analysisRepository.save(analysis);

        video.status = 'completed';
        await this.videoRepository.save(video);
        await job.progress(100);

        return {
          videoInfo,
          transcription: transcriptionResult,
          analysis: analysisResult,
          status: 'completed',
        };
      } catch (error) {
        if (audioPath) {
          await unlink(audioPath).catch(() => {});
        }
        if (video) {
          video.status = 'failed';
          await this.videoRepository.save(video);
        }

        logger.error(`Job processing error: ${String(error)}`);

        if (
          error instanceof AppError &&
          (error.message.includes('No transcription results found') ||
            error.message.includes('This video is private') ||
            error.message.includes('Video not found'))
        ) {
          return { error: error.message, status: 'failed', final: true };
        }
        throw error;
      }
    });

    // было: on('completed', async (job, result) => {...}) — теперь не async, с void-обёрткой внутри
    this.transcriptionQueue.on('completed', (job, result: JobResult) => {
      void (async () => {
        try {
          const user = await this.userRepository.findOne({ where: { id: job.data.userId } });
          if (user && result.videoInfo) {
            // TODO: send a job completion email
          }
        } catch (error) {
          logger.error(`Error sending job completion email: ${String(error)}`);
        }
      })();
    });

    // было: on('failed', async (job, error) => {...}) — убрали async, await не было
    this.transcriptionQueue.on('failed', (job, error) => {
      logger.error(`Job ${job.id} failed: ${String(error)}`);
    });

    this.transcriptionQueue.on('error', (error) => {
      logger.error(`Transcription queue error: ${String(error)}`);
    });

    // было: три отдельных вызова .clean(...) без await — теперь обёрнуты в Promise.all + await
    await Promise.all([
      this.transcriptionQueue.clean(TWENTY_FOUR_HOURS_MS, 'delayed'),
      this.transcriptionQueue.clean(TWENTY_FOUR_HOURS_MS, 'wait'),
      this.transcriptionQueue.clean(TWENTY_FOUR_HOURS_MS, 'active'),
    ]);
  }

  static async addTranscriptionJob(
    url: string,
    videoInfo?: VideoInfo,
    user?: User,
  ): Promise<{ jobId: string | number }> {
    let video = await this.videoRepository.findOne({ where: { url } });

    if (!video) {
      video = new Video();
      video.url = url;
      video.status = 'pending';
      video.user = user as User;

      if (videoInfo) {
        Object.assign(video, {
          title: videoInfo.title,
          description: videoInfo.description,
          author: videoInfo.author,
          duration: videoInfo.duration,
          thumbnail: videoInfo.thumbnail,
        });
      }
    }

    await this.videoRepository.save(video);

    const job = await this.transcriptionQueue.add({
      url,
      ...(videoInfo !== undefined && { videoInfo }),
      userId: user?.id ?? '',
    });

    return { jobId: job.id };
  }
}
