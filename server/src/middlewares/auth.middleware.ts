import { type Request, type Response, type NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from '../services/auth.services.js';
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized');
    }
    const decoded = AuthService.verifyToken(token);

    req.user = decoded;
  } catch (error) {}
};
