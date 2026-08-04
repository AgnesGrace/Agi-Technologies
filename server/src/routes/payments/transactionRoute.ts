import express, { Router } from 'express';
import { createStripeTransactionIntent } from '../../controllers/payments/transactionController.js';

const PaymentRouter: Router = express.Router();

PaymentRouter.route('/stripe/transaction-intent').post(
  createStripeTransactionIntent,
);

export default PaymentRouter;
