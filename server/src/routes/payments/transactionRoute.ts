import express, { Router } from 'express';
import {
  createStripeTransaction,
  createStripeTransactionIntent,
} from '../../controllers/payments/transactionController.js';

const PaymentRouter: Router = express.Router();

PaymentRouter.route('/stripe').post(createStripeTransaction);
PaymentRouter.route('/stripe/transaction-intent').post(
  createStripeTransactionIntent,
);

export default PaymentRouter;
