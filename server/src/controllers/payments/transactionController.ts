import { Request, Response } from 'express';
import Stripe from 'stripe';
import { getAuth } from '@clerk/express';
import db from '../../db/db.js';
import { fulfillPaidEnrollment } from '../../services/fulfill-enrollment.js';
import { buildPagination, parsePagination } from '../../utils/helper.js';
import { logger } from '../../utils/logger.js';
import { isPurchasableAmount } from '../../utils/money.js';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(stripeSecretKey);

const assertOwnedPaymentIntent = (
  paymentIntent: Stripe.PaymentIntent,
  userId: string,
  courseSlug?: string,
) => {
  if (paymentIntent.status !== 'succeeded') {
    return 'Payment has not succeeded.';
  }

  if (paymentIntent.metadata?.userId !== userId) {
    return 'Payment does not belong to this user.';
  }

  if (courseSlug && paymentIntent.metadata?.courseSlug !== courseSlug) {
    return 'Payment does not match this course.';
  }

  return null;
};

/**
 * Reuse an open PaymentIntent for the same user+course+amount when possible.
 * Falls back to Stripe idempotency so React remounts do not mint new intents.
 */
const getOrCreatePaymentIntent = async ({
  userId,
  courseId,
  courseSlug,
  amountInCents,
}: {
  userId: string;
  courseId: number;
  courseSlug: string;
  amountInCents: number;
}) => {
  try {
    const search = await stripe.paymentIntents.search({
      query: [
        `metadata["userId"]:"${userId}"`,
        `metadata["courseId"]:"${courseId}"`,
        `status:"requires_payment_method"`,
      ].join(' AND '),
      limit: 5,
    });

    const reusable = search.data.find(
      (intent) =>
        intent.amount === amountInCents &&
        intent.currency === 'usd' &&
        Boolean(intent.client_secret),
    );

    if (reusable) {
      return reusable;
    }
  } catch (error) {
    logger.warn(
      { err: error, requestType: 'payment_intent_search' },
      'PaymentIntent search unavailable; falling back to create',
    );
  }

  return stripe.paymentIntents.create(
    {
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      metadata: {
        userId,
        courseId: String(courseId),
        courseSlug,
      },
    },
    {
      // Same checkout remount within 24h returns the same intent.
      idempotencyKey: `checkout:${userId}:${courseId}:${amountInCents}`,
    },
  );
};

export const createStripeTransactionIntent = async (
  req: Request,
  res: Response,
) => {
  try {
    const auth = getAuth(req);
    const userId = auth.userId;

    if (!userId) {
      return res.status(401).json({
        status: 'failed',
        message: 'Unauthorized',
      });
    }

    const { courseSlug } = req.body;
    if (!courseSlug) {
      return res.status(400).json({
        status: 'fail',
        message: 'courseSlug is required.',
      });
    }

    const course = await db.course.findUnique({
      where: {
        slug: String(courseSlug),
      },
      select: {
        id: true,
        slug: true,
        price: true,
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
        userId,
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

    // Course.price is already integer cents.
    const amountInCents = course.price;

    if (!isPurchasableAmount(amountInCents)) {
      return res.status(400).json({
        status: 'fail',
        message: 'This course cannot be purchased through Stripe checkout.',
      });
    }

    const paymentIntent = await getOrCreatePaymentIntent({
      userId,
      courseId: course.id,
      courseSlug: course.slug,
      amountInCents,
    });

    if (paymentIntent.status === 'succeeded') {
      await fulfillPaidEnrollment({
        userId,
        courseId: course.id,
        transactionId: paymentIntent.id,
        amount: paymentIntent.amount,
      });

      return res.status(409).json({
        status: 'fail',
        code: 'ALREADY_ENROLLED',
        message: 'Payment already completed for this course.',
      });
    }

    if (!paymentIntent.client_secret) {
      return res.status(500).json({
        status: 'failed',
        message: 'Unable to start checkout.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { clientSecret: paymentIntent.client_secret },
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: req.requestId },
      'Error creating Stripe transaction intent',
    );
    return res
      .status(500)
      .json({ status: 'failed', error: 'Failed to create transaction intent' });
  }
};

export const createStripeTransaction = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const userId = auth.userId;

    if (!userId) {
      return res.status(401).json({
        status: 'failed',
        message: 'Unauthorized',
      });
    }

    const { courseSlug, transactionId } = req.body?.transaction ?? {};

    if (!courseSlug || !transactionId) {
      return res.status(400).json({
        status: 'fail',
        message: 'courseSlug and transactionId are required.',
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(
      String(transactionId),
    );

    const ownershipError = assertOwnedPaymentIntent(
      paymentIntent,
      userId,
      String(courseSlug),
    );

    if (ownershipError) {
      return res.status(400).json({
        status: 'fail',
        message: ownershipError,
      });
    }

    const courseId = Number(paymentIntent.metadata.courseId);

    if (!Number.isFinite(courseId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Payment is missing course metadata.',
      });
    }

    const result = await fulfillPaidEnrollment({
      userId,
      courseId,
      transactionId: paymentIntent.id,
      amount: paymentIntent.amount,
    });

    return res.status(result.alreadyProcessed ? 200 : 201).json({
      status: 'success',
      message: result.alreadyProcessed
        ? 'Enrollment already completed for this payment.'
        : 'Transaction successfully authorized: Course unlocked and dashboard progress initialized.',
      data: result,
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: req.requestId },
      'Checkout enrollment failed',
    );

    return res.status(500).json({
      status: 'error',
      message: 'Unable to complete enrollment.',
    });
  }
};

export const stripeWebhook = async (req: Request, res: Response) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error('STRIPE_WEBHOOK_SECRET is not set');
    return res.status(500).json({
      status: 'error',
      message: 'Webhook is not configured.',
    });
  }

  const signature = req.headers['stripe-signature'];

  if (!signature || typeof signature !== 'string') {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing Stripe signature.',
    });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    logger.warn({ err: error }, 'Stripe webhook signature verification failed');
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid webhook signature.',
    });
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const userId = paymentIntent.metadata?.userId;
      const courseId = Number(paymentIntent.metadata?.courseId);

      if (!userId || !Number.isFinite(courseId)) {
        logger.error(
          { paymentIntentId: paymentIntent.id },
          'Succeeded payment intent missing metadata',
        );
      } else {
        await fulfillPaidEnrollment({
          userId,
          courseId,
          transactionId: paymentIntent.id,
          amount: paymentIntent.amount,
        });
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    logger.error({ err: error }, 'Stripe webhook processing failed');
    return res.status(500).json({
      status: 'error',
      message: 'Webhook processing failed.',
    });
  }
};

export const getMyTransactions = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        status: 'failed',
        message: 'Unauthorized',
      });
    }

    const { page, limit } = req.query as { page?: string; limit?: string };
    const { currentPage, pageSize, skip } = parsePagination(page, limit);

    const where = { userId };

    const [transactions, totalTransactions] = await Promise.all([
      db.transaction.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          course: {
            select: {
              id: true,
              slug: true,
              title: true,
              image: true,
            },
          },
        },
      }),
      db.transaction.count({ where }),
    ]);

    return res.status(200).json({
      status: 'success',
      data: {
        transactions,
        pagination: buildPagination(totalTransactions, currentPage, pageSize),
      },
    });
  } catch (error) {
    logger.error(
      { err: error, requestId: req.requestId },
      'Error retrieving transactions',
    );
    return res.status(500).json({
      status: 'error',
      message: 'Unable to retrieve billing history.',
    });
  }
};
