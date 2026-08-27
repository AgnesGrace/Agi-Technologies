import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import courseRouter from './routes/courses/courseRoute.js';
import { clerkMiddleware, createClerkClient } from '@clerk/express';
import userRouter from './routes/users/userRoutes.js';
import paymentRouter from './routes/payments/transactionRoute.js';
import { stripeWebhook } from './controllers/payments/transactionController.js';
import db from './db/db.js';

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

const app = express();

app.use(helmet());
app.use(helmet.crossOriginResourcePolicy());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

const allowedOrigins = (process.env.CLIENT_ORIGIN ?? 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.post(
  '/api/v1/payments/stripe/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook,
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(clerkMiddleware());

app.get('/', (req, res) => res.send('Welcome to Agi Technologies'));

app.get('/health', async (_req, res) => {
  try {
    await db.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ status: 'unhealthy' });
  }
});

app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/payments', paymentRouter);

export default app;
