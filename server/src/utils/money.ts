export const STRIPE_MIN_AMOUNT_CENTS = 50;

export const dollarsToCents = (dollars: number): number =>
  Math.round(dollars * 100);

export const isPurchasableAmount = (amountInCents: number): boolean =>
  Number.isFinite(amountInCents) && amountInCents >= STRIPE_MIN_AMOUNT_CENTS;
