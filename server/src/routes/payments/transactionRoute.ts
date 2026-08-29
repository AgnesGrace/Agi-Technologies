import express, { Router } from 'express';
import {
  createStripeTransaction,
  createStripeTransactionIntent,
  getMyTransactions,
} from '../../controllers/payments/transactionController.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import {
  authReadLimiter,
  sensitiveLimiter,
} from '../../middleware/rate-limit.js';

const PaymentRouter: Router = express.Router();

PaymentRouter.route('/stripe').post(
  requireAuth,
  sensitiveLimiter,
  createStripeTransaction,
);
PaymentRouter.route('/stripe/transaction-intent').post(
  requireAuth,
  sensitiveLimiter,
  createStripeTransactionIntent,
);
PaymentRouter.route('/transactions').get(
  requireAuth,
  authReadLimiter,
  getMyTransactions,
);

export default PaymentRouter;
