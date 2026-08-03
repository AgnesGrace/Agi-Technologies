import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import courseRouter from './routes/courses/courseRoute.js';
import { clerkMiddleware, createClerkClient } from '@clerk/express';
import userRouter from './routes/users/userRoutes.js';

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

const app = express();
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy());

app.use(morgan('dev'));
app.use(cors());

app.use(clerkMiddleware());

app.get('/', (req, res) => res.send('Welcome to Agi Technologies'));
app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/users', userRouter);

export default app;
