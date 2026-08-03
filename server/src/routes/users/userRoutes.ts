import express, { Router } from 'express';
import { updateUser } from '../../controllers/users/userController.js';

const userRouter: Router = express.Router();

userRouter.route('/:userId').put(updateUser);

export default userRouter;
