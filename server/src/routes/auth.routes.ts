import { Router } from 'express';
import { successResponse } from '../utils/response.js';
import { AuthController } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', AuthController.register);

export default router;
