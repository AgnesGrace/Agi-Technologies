import express, { Router } from 'express';
import {
  createStripeTransaction,
  createStripeTransactionIntent,
  getMyTransactions,
} from '../../controllers/payments/transactionController.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const PaymentRouter: Router = express.Router();

PaymentRouter.route('/stripe').post(requireAuth, createStripeTransaction);
PaymentRouter.route('/stripe/transaction-intent').post(
  requireAuth,
  createStripeTransactionIntent,
);
PaymentRouter.route('/transactions').get(requireAuth, getMyTransactions);

export default PaymentRouter;
