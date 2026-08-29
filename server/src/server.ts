import dotenv from 'dotenv';
dotenv.config();
import { validateEnv } from './utils/validate-env.js';

validateEnv();

import app from './index.js';
import db from './db/db.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 8001;

const server = app.listen(PORT, () =>
  logger.info({ port: PORT }, 'App is listening'),
);

const shutdown = () => {
  server.close(async () => {
    await db.$disconnect();
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
