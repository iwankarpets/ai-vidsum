import { type NextFunction, type Request, type Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { successResponse } from '../utils/response.js';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/errors.js';
import { toPublicUser } from '../utils/user.js';
import { REFRESH_COOKIE, refreshCookieOptions, clearCookieOptions } from '../config/auth.js';
import type {
  RegisterInput,
  LoginInput,
  ResendVerificationInput,
} from '../validations/auth.validation.js';

const readRefreshCookie = (req: Request): string | undefined => {
  const cookies = req.cookies as Record<string, unknown> | undefined;
  const value = cookies?.[REFRESH_COOKIE];
  return typeof value === 'string' && value ? value : undefined;
};

export class AuthController {
  static async register(
    req: Request<unknown, unknown, RegisterInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { email, password, name } = req.body;
      const { refreshToken, ...body } = await AuthService.register(email, password, name);

      res
        .status(StatusCodes.CREATED)
        .cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions)
        .json(successResponse(body));
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
      const { refreshToken, ...body } = await AuthService.login(email, password);

      res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions).json(successResponse(body));
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const rawToken = readRefreshCookie(req);

      if (!rawToken) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'No refresh token', 'NO_REFRESH_TOKEN');
      }

      const result = await AuthService.refresh(rawToken);
      res.json(successResponse(result));
    } catch (error) {
      res.clearCookie(REFRESH_COOKIE, clearCookieOptions);
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const rawToken = readRefreshCookie(req);

      if (rawToken) {
        await AuthService.logout(rawToken);
      }

      res.clearCookie(REFRESH_COOKIE, clearCookieOptions);
      res.json(successResponse({ message: 'Logged out' }));
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid token', 'INVALID_TOKEN');
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
        throw new AppError(StatusCodes.UNAUTHORIZED, 'User not authenticated', 'UNAUTHORIZED');
      }

      const user = await AuthService.getUserById(userId);
      res.json(successResponse(toPublicUser(user)));
    } catch (error) {
      next(error);
    }
  }
}
