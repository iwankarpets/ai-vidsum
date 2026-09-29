import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  verifyEmailSchema,
} from '../validations/auth.validation.js';

const router = Router();

router.post('/register', validate(registerSchema), (req, res, next) =>
  AuthController.register(req, res, next),
);
router.post('/login', validate(loginSchema), (req, res, next) =>
  AuthController.login(req, res, next),
);
router.get('/verify-email', validate(verifyEmailSchema), (req, res, next) =>
  AuthController.verifyEmail(req, res, next),
);
router.post('/resend-verification', validate(resendVerificationSchema), (req, res, next) =>
  AuthController.resendVerificationEmail(req, res, next),
);

router.get('/me', (req, res, next) => AuthController.getProfile(req, res, next));

export default router;
