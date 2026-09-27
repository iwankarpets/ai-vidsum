import { type Request, type Response, type NextFunction } from 'express';
import { type ZodType } from 'zod';
import { AppError } from '../utils/errors.js';
import { StatusCodes } from 'http-status-codes';

export const validate =
  <T extends ZodType>(schema: T) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body as unknown,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');

      return next(new AppError(StatusCodes.BAD_REQUEST, message));
    }

    const data = result.data;

    if (typeof data === 'object' && data !== null && 'body' in data) {
      req.body = (data as Record<string, unknown>).body;
    }

    next();
  };
