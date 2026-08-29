import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPrice = (
  amountInCents: number,
  currency = "USD",
  locale = "en-US"
): string => {
  if (typeof amountInCents !== "number" || isNaN(amountInCents)) {
    return "-"
  }
  if (amountInCents === 0) return "Free"

  const amount = amountInCents / 100

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: amountInCents % 100 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}
