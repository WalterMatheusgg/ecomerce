import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError.js';
import { errorResponse } from '../utils/api-response.js';

export const errorMiddleware: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(errorResponse(err.message, err.statusCode));
  }
  // Do not expose internal error messages (like Prisma internals) to clients in production.
  if (err instanceof Error) {
    console.error(err);
    return res.status(500).json(errorResponse('Internal server error', 500));
  }

  console.error('Unknown error', err);
  return res.status(500).json(errorResponse('Internal server error', 500));
};
