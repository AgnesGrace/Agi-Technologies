import { Request, Response } from 'express';
import Stripe from 'stripe';
import db from '../../db/db.js';
import { Course } from '../../generated/prisma/client.js';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(stripeSecretKey);

export const createStripeTransactionIntent = async (
  req: Request,
  res: Response,
) => {
  try {
    const { userId, courseSlug, amount } = req.body;
    if (!userId || !courseSlug) {
      return res.status(400).json({
        status: 'fail',
        message: 'userId and courseSlug   are required.',
      });
    }

    const parsedAmount = parseInt(amount, 10);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'A valid payment amount is required.',
      });
    }

    const amountInCents = Math.round(parsedAmount * 100);

    if (amountInCents < 50) {
      return res.status(400).json({
        status: 'fail',
        message: 'Payment amount must be at least $0.50.',
      });
    }

    const course = await db.course.findUnique({
      where: {
        slug: String(courseSlug),
      },
      select: {
        id: true,
      },
    });

    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Course not found.',
      });
    }
    const existingEnrollment = await db.enrollment.findFirst({
      where: {
        userId: String(userId),
        courseId: course.id,
      },
    });

    if (existingEnrollment) {
      return res.status(409).json({
        status: 'fail',
        code: 'ALREADY_ENROLLED',
        message: 'You are already enrolled in this course.',
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents || 50,
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

export const createStripeTransaction = async (req: Request, res: Response) => {
  try {
    const { courseSlug, userId, transactionId, amount, paymentProvider } =
      req.body?.transaction;

    console.log(req.body);
    if (!courseSlug || !userId || !transactionId || !amount) {
      return res.status(400).json({
        status: 'fail',
        message:
          'Missing mandatory payload attributes: courseSlug, userId, transactionId, and amount must be provided.',
      });
    }
    const course = await db.course.findUnique({
      where: { slug: String(courseSlug) },
    });

    if (!course) {
      return res.status(404).json({
        status: 'failed',
        message:
          'The transaction reference could not be processed because the course listing does not exist.',
      });
    }
    const result = await db.$transaction(async (trans) => {
      const transaction = await trans.transaction.create({
        data: {
          courseId: course?.id,
          userId,
          transactionId,
          amount: Number(amount),
          paymentProvider: paymentProvider || 'stripe',
          createdAt: new Date().toISOString(),
        },
      });

      const enrollment = await trans.enrollment.create({
        data: {
          userId: String(userId),
          courseId: course.id,
        },
      });

      const initialCourseProgress = await trans.progress.create({
        data: {
          userId: String(userId),
          courseId: course.id,
          overallProgress: 0.0,
          isCompleted: false,
        },
      });
      return { transaction, enrollment, initialCourseProgress };
    });

    res.status(201).json({
      status: 'success',
      message:
        'Transaction successfully authorized: Course unlocked and dashboard progress initialized.',
      data: result,
    });
  } catch (error) {
    console.error('❌ Production Checkout Controller Exception:', error);

    res.status(500).json({
      status: 'error',
      message: 'Internal server initialization error.',
    });
  }
};
