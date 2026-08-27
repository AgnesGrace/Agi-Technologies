import express, { Router } from 'express';
import { updateUser } from '../../controllers/users/userController.js';
import { syncClerkUserHandler } from '../../controllers/users/syncClerkUser.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const userRouter: Router = express.Router();

userRouter.route('/:userId').put(requireAuth, updateUser);

userRouter.route('/me/sync-user').post(requireAuth, syncClerkUserHandler);

export default userRouter;
