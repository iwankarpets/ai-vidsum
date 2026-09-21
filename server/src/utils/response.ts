interface SuccessResponse<T> {
  status: 'success';
  data: T;
}

interface ErrorResponse {
  status: 'error';
  message: string;
  error?: unknown;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

const serializeError = (error: unknown): unknown =>
  error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error;

export const successResponse = <T>(data: T): SuccessResponse<T> => ({
  status: 'success',
  data,
});

export const errorResponse = (message: string, error?: unknown): ErrorResponse => ({
  status: 'error',
  message,
  ...(process.env.NODE_ENV === 'development' && error !== undefined
    ? { error: serializeError(error) }
    : {}),
});
