import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import videoRoutes from './video.routes.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/video', authenticate, videoRoutes);

export default router;
