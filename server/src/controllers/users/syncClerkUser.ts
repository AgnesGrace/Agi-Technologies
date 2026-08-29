import { getAuth } from '@clerk/express';
import { Request, Response } from 'express';
import { ensureClerkUserInDb } from '../../services/ensure-clerk-user.js';

export const syncClerkUserHandler = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);

    if (!auth.userId) {
      return res
        .status(401)
        .json({ status: 'failed', message: 'unauthorized' });
    }

    const user = await ensureClerkUserInDb(auth.userId, { forceRefresh: true });

    return res.status(200).json({
      status: 'success',
      message: 'User synchronized successfully',
      data: user,
    });
  } catch (error) {
    console.error('ENSURE USER ERROR:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to synchronize user';

    return res.status(500).json({
      status: 'error',
      message,
    });
  }
};
