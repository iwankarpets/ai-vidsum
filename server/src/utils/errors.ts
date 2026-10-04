import logger from './logger.js';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const handleError = (error: Error) => {
  if (error instanceof AppError && error.isOperational) {
    return {
      status: 'error',
      statusCode: error.statusCode,
      message: error.message,
      code: error.code,
    };
  }

  logger.error(error);
  return {
    status: 'error',
    statusCode: 500,
    message: 'Internal Server Error',
    code: 'INTERNAL_SERVER_ERROR',
  };
};
