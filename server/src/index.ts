import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import courseRouter from './routes/courses/courseRoute.js';
import { clerkMiddleware, createClerkClient } from '@clerk/express';
import userRouter from './routes/users/userRoutes.js';
import paymentRouter from './routes/payments/transactionRoute.js';
import mediaRouter from './routes/media/mediaRoute.js';
import { stripeWebhook } from './controllers/payments/transactionController.js';
import db from './db/db.js';
import { requestId } from './middleware/request-id.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { logger } from './utils/logger.js';
import type { IncomingMessage } from 'http';

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

const app = express();

// Behind a load balancer / reverse proxy, use the real client IP for rate limits.
app.set('trust proxy', 1);

app.use(requestId);
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(
    pinoHttp({
      logger,
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'req.body',
          'req.body.transaction',
        ],
        remove: true,
      },
      customProps: (req: IncomingMessage & { requestId?: string }) => ({
        requestId: req.requestId,
      }),
    }),
  );
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

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(clerkMiddleware());

app.get('/', (_req, res) => res.send('Welcome to Agi Technologies'));

app.get('/health', async (_req, res) => {
  try {
    await db.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    logger.error({ err: error }, 'Health check failed');
    res.status(503).json({ status: 'unhealthy' });
  }
});

app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/media', mediaRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
