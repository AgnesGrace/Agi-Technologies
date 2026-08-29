import express, { Router } from 'express';
import {
  createDownloadPresign,
  createUploadPresign,
} from '../../controllers/media/mediaController.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { sensitiveLimiter } from '../../middleware/rate-limit.js';

const mediaRouter: Router = express.Router();

mediaRouter
  .route('/uploads/presign')
  .post(requireAuth, sensitiveLimiter, createUploadPresign);

mediaRouter
  .route('/downloads/presign')
  .post(requireAuth, sensitiveLimiter, createDownloadPresign);

export default mediaRouter;
