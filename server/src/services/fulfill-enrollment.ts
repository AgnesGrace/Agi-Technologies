import db from '../db/db.js';
import { Prisma } from '../generated/prisma/client.js';

interface FulfillEnrollmentInput {
  userId: string;
  courseId: number;
  transactionId: string;
  amount: number;
  paymentProvider?: string;
}

export const fulfillPaidEnrollment = async ({
  userId,
  courseId,
  transactionId,
  amount,
  paymentProvider = 'stripe',
}: FulfillEnrollmentInput) => {
  const existingTransaction = await db.transaction.findUnique({
    where: { transactionId },
  });

  if (existingTransaction) {
    return {
      alreadyProcessed: true,
      transaction: existingTransaction,
    };
  }

  try {
    const result = await db.$transaction(async (trans) => {
      const transaction = await trans.transaction.create({
        data: {
          courseId,
          userId,
          transactionId,
          amount,
          paymentProvider,
        },
      });

      const enrollment = await trans.enrollment.upsert({
        where: {
          userId_courseId: { userId, courseId },
        },
        create: { userId, courseId },
        update: {},
      });

      const initialCourseProgress = await trans.progress.upsert({
        where: {
          userId_courseId: { userId, courseId },
        },
        create: {
          userId,
          courseId,
          overallProgress: 0.0,
          isCompleted: false,
        },
        update: {},
      });

      return { transaction, enrollment, initialCourseProgress };
    });

    return { alreadyProcessed: false, ...result };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const transaction = await db.transaction.findUnique({
        where: { transactionId },
      });

      return {
        alreadyProcessed: true,
        transaction,
      };
    }

    throw error;
  }
};
