import { getAuth } from '@clerk/express';
import { NextFunction, Request, Response } from 'express';

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({
      status: 'failed',
      message: 'Unauthorized',
    });
  }

  next();
};
