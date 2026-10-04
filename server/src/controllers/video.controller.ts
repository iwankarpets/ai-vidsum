import { type Request, type Response, type NextFunction } from 'express';
import { VideoService } from '../services/video.service.js';
import { successResponse } from '../utils/response.js';
import { AuthService } from '../services/auth.service.js';
import { JobsService } from '../services/jobs.service.js';
import { AppError } from '../utils/errors.js';
import { StatusCodes } from 'http-status-codes';
import type { GetVideoInfoInput } from '../validations/video.validation.js';
import { transformVideo } from '../utils/transformer.js';

export class VideoController {
  static async getVideoInfo(
    req: Request<unknown, unknown, GetVideoInfoInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { url } = req.body;
      const videoInfo = await VideoService.getVideoInfo(url);

      res.json(successResponse(videoInfo));
    } catch (error) {
      next(error);
    }
  }

  static async downloadAudio(
    req: Request<unknown, unknown, GetVideoInfoInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { url } = req.body;
      const videoInfo = await VideoService.getVideoInfo(url);
      const audioPath = await VideoService.downloadAudio(url);

      res.json(
        successResponse({
          ...videoInfo,
          audioPath,
          message: 'Audio downloaded successfully',
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  static async transcribeVideo(
    req: Request<unknown, unknown, GetVideoInfoInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { url } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized', 'UNAUTHORIZED');
      }

      const user = await AuthService.getUserById(userId);

      const videoInfo = await VideoService.getVideoInfo(url);

      const { jobId } = await JobsService.addTranscriptionJob(url, videoInfo, user);

      res.json(
        successResponse({
          jobId,
          videoInfo,
          message: 'Transcription job created successfully',
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  static async getTranscriptionStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
       throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized', 'UNAUTHORIZED');
      }

      if (!jobId || typeof jobId !== 'string') {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid job ID', 'INVALID_JOB_ID');
      }

      const status = await JobsService.getJobStatus(jobId, userId);
      res.json(successResponse(status));
    } catch (error) {
      next(error);
    }
  }

  static async getVideoById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized', 'UNAUTHORIZED');
      }

      if (!id || typeof id !== 'string') {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid video ID', 'INVALID_VIDEO_ID');
      }

      const video = await VideoService.getVideoById(id, userId);

      if (!video) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Video not found', 'VIDEO_NOT_FOUND');
      }

      res.json(successResponse(transformVideo(video)));
    } catch (error) {
      next(error);
    }
  }

  static async getAllJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized', 'UNAUTHORIZED');
      }

      const jobs = await JobsService.getAllJobs(userId);
      res.json(successResponse(jobs));
    } catch (error) {
      next(error);
    }
  }

  static async getUserVideos(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
       throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized', 'UNAUTHORIZED');
      }

      const videos = await VideoService.getUserVideos(userId);
      res.json(successResponse(videos.map(transformVideo)));
    } catch (error) {
      next(error);
    }
  }
}
