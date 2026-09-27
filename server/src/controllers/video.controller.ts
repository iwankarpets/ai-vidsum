import { type Request, type Response, type NextFunction } from 'express';
import { VideoService } from '../services/video.service.js';
import { successResponse } from '../utils/response.js';
import { AuthService } from '../services/auth.service.js';
import { JobsService } from '../services/jobs.service.js';
import { AppError } from '../utils/errors.js';
import { StatusCodes } from 'http-status-codes';
import type { GetVideoInfoInput } from '../validations/video.validation.js';

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
        throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized');
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
}
