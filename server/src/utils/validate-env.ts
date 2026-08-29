const requiredEnv = [
  'DATABASE_URL',
  'CLERK_SECRET_KEY',
  'STRIPE_SECRET_KEY',
] as const;

export const validateEnv = () => {
  const missing = requiredEnv.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }

  if (
    process.env.NODE_ENV === 'production' &&
    !process.env.STRIPE_WEBHOOK_SECRET
  ) {
    throw new Error('STRIPE_WEBHOOK_SECRET is required in production');
  }
};
