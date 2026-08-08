import express, { Router } from 'express';
import { updateUser } from '../../controllers/users/userController.js';
import { syncClerkUserHandler } from '../../controllers/users/syncClerkUser.js';

const userRouter: Router = express.Router();

userRouter.route('/:userId').put(updateUser);

userRouter.route('/me/sync-user').post(syncClerkUserHandler);

export default userRouter;
