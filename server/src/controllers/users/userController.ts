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
  console.log(auth);
  if (!auth.isAuthenticated) {
    return res.status(401).json({
      status: 'failed',
      message: 'Unauthorized',
    });
  }
  try {
    const user = await clerkClient.users.updateUserMetadata(userId as string, {
      publicMetadata: {
        userRole: userInfo.publicMetadata.userRole,
        settings: userInfo.publicMetadata.settings,
      },
    });
    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: user,
    });
  } catch (err) {
    res.status(401).json({
      status: 'failed',
      message: 'Something went wrong while updating user',
    });
  }
};
