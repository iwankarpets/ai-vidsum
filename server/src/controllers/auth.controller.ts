import { type NextFunction, type Request, type Response } from 'express';
import { AuthService } from '../services/auth.services.js';
import { successResponse } from '../utils/response.js';
import { StatusCodes } from 'http-status-codes';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;
      const result = await AuthService.register(email, password, name);
      res.status(StatusCodes.CREATED).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }
}
