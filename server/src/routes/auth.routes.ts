import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  verifyEmailSchema,
} from '../validations/auth.validations.js';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.get('/verify-email', validate(verifyEmailSchema), AuthController.verifyEmail);
router.post(
  '/resend-verification',
  validate(resendVerificationSchema),
  AuthController.resendVerificationEmail,
);

export default router;
