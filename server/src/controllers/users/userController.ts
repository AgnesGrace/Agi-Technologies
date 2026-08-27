import { Request, Response } from 'express';
import { clerkClient } from '../../index.js';
import { getAuth } from '@clerk/express';

export const updateUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const userInfo = req.body;
  const auth = getAuth(req);

  if (!userId || !userInfo) {
    return res.status(400).json({
      status: 'failed',
      message: 'User id or the user info is missing',
    });
  }

  if (!auth.userId) {
    return res.status(401).json({
      status: 'failed',
      message: 'Unauthorized',
    });
  }

  if (auth.userId !== userId) {
    return res.status(403).json({
      status: 'failed',
      message: 'You can only update your own account',
    });
  }

  try {
    const user = await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        settings: userInfo.publicMetadata?.settings,
      },
    });
    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: user,
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({
      status: 'failed',
      message: 'Something went wrong while updating user',
    });
  }
};
