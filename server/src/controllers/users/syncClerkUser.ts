import { getAuth } from '@clerk/express';
import { Request, Response } from 'express';
import { clerkClient } from '../../index.js';
import { syncClerkUser } from '../../services/sync-clerk-user.js';

export const syncClerkUserHandler = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);

    if (!auth.userId) {
      return res
        .status(401)
        .json({ status: 'failed', message: 'unauthorized' });
    }
    const userId = auth.userId;
    const clerkUser = await clerkClient.users.getUser(userId);

    const email = clerkUser.primaryEmailAddress?.emailAddress;

    if (!email) {
      return res.status(400).json({
        status: 'failed',
        message: 'User email not found',
      });
    }

    const name =
      `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() ||
      email;

    const user = await syncClerkUser({
      id: clerkUser.id,
      email,
      name,
      imageUrl: clerkUser.imageUrl ?? null,
    });

    return res.status(200).json({
      status: 'success',
      message: 'User synchronized successfully',
      data: user,
    });
  } catch (error) {
    console.error('ENSURE USER ERROR:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Failed to synchronize user',
    });
  }
};
