import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger.js';

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({
    status: 'fail',
    message: 'Route not found.',
  });
};

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const status =
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    typeof (err as { status: unknown }).status === 'number'
      ? (err as { status: number }).status
      : 500;

  const message = err instanceof Error ? err.message : 'Internal server error.';

  logger.error(
    {
      err,
      requestId: req.requestId,
      method: req.method,
      path: req.path,
    },
    'Unhandled request error',
  );

  if (res.headersSent) {
    return;
  }

  res.status(status).json({
    status: 'error',
    message:
      process.env.NODE_ENV === 'production' && status === 500
        ? 'Internal server error.'
        : message,
    requestId: req.requestId,
  });
};
