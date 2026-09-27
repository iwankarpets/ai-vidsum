import { Router } from 'express';
import { VideoController } from '../controllers/video.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  downloadAudioSchema,
  getVideoInfoSchema,
  transcribeVideoSchema,
} from '../validations/video.validation.js';

const router = Router();

router.post('/info', validate(getVideoInfoSchema), (req, res, next) =>
  VideoController.getVideoInfo(req, res, next),
);
router.post('/audio', validate(downloadAudioSchema), (req, res, next) =>
  VideoController.downloadAudio(req, res, next),
);
router.post('/transcribe', validate(transcribeVideoSchema), (req, res, next) =>
  VideoController.transcribeVideo(req, res, next),
);

export default router;
