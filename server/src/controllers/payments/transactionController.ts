import { Request, Response } from 'express';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(stripeSecretKey);

export const createStripeTransactionIntent = async (
  req: Request,
  res: Response,
) => {
  let amount = parseInt(req.body);
  if (!amount || amount <= 0) {
    amount = 50;
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });
    return res.status(200).json({
      status: 'success',
      data: { clientSecret: paymentIntent.client_secret },
    });
  } catch (error: any) {
    console.error('Error creating Stripe transaction intent:', error);
    return res
      .status(500)
      .json({ status: 'failed', error: 'Failed to create transaction intent' });
  }
};
