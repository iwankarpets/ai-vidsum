import { type NextFunction, type Request, type Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { successResponse } from '../utils/response.js';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/errors.js';
import type {
  LoginInput,
  RegisterInput,
  ResendVerificationInput,
} from '../validations/auth.validation.js';

export class AuthController {
  static async register(
    req: Request<unknown, unknown, RegisterInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { email, password, name } = req.body;
      const result = await AuthService.register(email, password, name);
      res.status(StatusCodes.CREATED).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  static async login(
    req: Request<unknown, unknown, LoginInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid token');
      }

      const result = await AuthService.verifyEmail(token);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  static async resendVerificationEmail(
    req: Request<unknown, unknown, ResendVerificationInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { email } = req.body;
      const result = await AuthService.resendVerificationEmail(email);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
      }

      const result = await AuthService.getUserById(userId);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }
}
