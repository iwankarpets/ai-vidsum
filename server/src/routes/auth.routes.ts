import { Router } from 'express';
import { successResponse } from '../utils/response.js';
import { AuthController } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/verify-email', AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerificationEmail);

export default router;
