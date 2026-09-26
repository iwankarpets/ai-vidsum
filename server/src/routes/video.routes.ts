import { Router } from 'express';
import { VideoController } from '../controllers/video.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { getVideoInfoSchema } from '../validations/video.validation.js';

const router = Router();

router.post('/info', validate(getVideoInfoSchema), VideoController.getVideoInfo);
router.post('/audio', validate(getVideoInfoSchema), VideoController.downloadAudio);
export default router;
