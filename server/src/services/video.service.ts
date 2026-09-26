import path from 'path';
import { createRequire } from 'module';
import { AppDataSource } from '../config/database.js';
import { Video } from '../entities/video.entity.js';
import { mkdir, stat } from 'fs/promises';
import ffmpeg from '@ffmpeg-installer/ffmpeg';
import { AppError } from '../utils/errors.js';
import { StatusCodes } from 'http-status-codes';
import logger from '../utils/logger.js';
import ytdl from 'ytdl-core';

export interface VideoInfo {
  title: string;
  description: string;
  duration: number;
  author: string;
  videoUrl: string;
  thumbnail: string;
  audioPath?: string;
}

type YoutubeDLOutput = {
  title: string;
  description?: string;
  duration: number;
  uploader: string;
  thumbnail?: string;
  thumbnails?: Array<{ url: string }>;
} & Record<string, unknown>;

const require = createRequire(import.meta.url);
const youtubeDl = require('youtube-dl-exec') as (
  url: string,
  flags: Record<string, unknown>,
) => Promise<unknown>;

const extractYoutubeVideoId = (videoUrl: string): string | null => {
  const match = videoUrl.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match?.[1] ?? null;
};

const getFallbackThumbnail = (videoUrl: string): string => {
  const videoId = extractYoutubeVideoId(videoUrl);
  return videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : '';
};

export class VideoService {
  private static readonly AUDIO_DIR = path.join(process.cwd(), 'temp', 'audio');
  private static readonly videoRepository = AppDataSource.getRepository(Video);

  static async ensureDirectoryExists(): Promise<void> {
    await mkdir(VideoService.AUDIO_DIR, { recursive: true });
  }

  static async getVideoInfo(url: string): Promise<VideoInfo> {
    try {
      const rawInfo = await youtubeDl(url, {
        dumpSingleJson: true,
        noWarnings: true,
        preferFreeFormats: true,
        ffmpegLocation: ffmpeg.path,
      });

      const info = rawInfo as YoutubeDLOutput;

      if (!info.title || !info.uploader || typeof info.duration !== 'number') {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid video info');
      }

      const thumbnail = info.thumbnail || info.thumbnails?.[0]?.url || getFallbackThumbnail(url);

      return {
        title: info.title,
        description: info.description || '',
        duration: info.duration,
        author: info.uploader,
        videoUrl: url,
        thumbnail,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error('Error getting video info', { error });

      if (error instanceof Error) {
        if (error.message.includes('Private video')) {
          throw new AppError(StatusCodes.FORBIDDEN, 'This video is private');
        }

        if (error.message.includes('not available')) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
        }
      }

      throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to get video info');
    }
  }

  static async downloadAudio(url: string): Promise<string> {
    try {
      await this.ensureDirectoryExists();

      const videoId = extractYoutubeVideoId(url);
      if (!videoId) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid YouTube URL');
      }

      const audioPath = path.join(this.AUDIO_DIR, `${videoId}.mp3`);

      await youtubeDl(url, {
        extractAudio: true,
        audioFormat: 'mp3',
        audioQuality: 0,
        output: audioPath,
        noWarnings: true,
        preferFreeFormats: true,
        ffmpegLocation: ffmpeg.path,
      });

      const fileStats = await stat(audioPath);

      if (fileStats.size === 0) {
        throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to download audio');
      }

      return audioPath;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error('Error downloading audio', { error });

      if (error instanceof Error) {
        if (error.message.includes('ffmpeg')) {
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to download audio');
        }
        if (error.message.includes('Private video')) {
          throw new AppError(StatusCodes.FORBIDDEN, 'This video is private');
        }
        if (error.message.includes('not available')) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
        }
      }

      throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to download audio');
    }
  }
}
