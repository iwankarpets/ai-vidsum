import { Router } from 'express';
import { VideoController } from '../controllers/video.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  downloadAudioSchema,
  getVideoInfoSchema,
  transcribeVideoSchema,
  getVideoByIdSchema,
  getJobStatusSchema,
} from '../validations/video.validation.js';

const router = Router();

router.get('/', (req, res, next) => VideoController.getUserVideos(req, res, next));

router.get('/jobs/running', (req, res, next) => VideoController.getAllJobs(req, res, next));

router.get('/transcribe/:jobId/status', validate(getJobStatusSchema), (req, res, next) =>
  VideoController.getTranscriptionStatus(req, res, next),
);

router.post('/info', validate(getVideoInfoSchema), (req, res, next) =>
  VideoController.getVideoInfo(req, res, next),
);
router.post('/audio', validate(downloadAudioSchema), (req, res, next) =>
  VideoController.downloadAudio(req, res, next),
);
router.post('/transcribe', validate(transcribeVideoSchema), (req, res, next) =>
  VideoController.transcribeVideo(req, res, next),
);

router.get('/:id', validate(getVideoByIdSchema), (req, res, next) =>
  VideoController.getVideoById(req, res, next),
);

export default router;
