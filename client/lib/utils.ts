import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPrice = (
  amount: number,
  currency = "USD",
  locale = "en-US"
): string => {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "-"
  }
  if (amount === 0) return "Free"

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch (error) {
    return `${currency} ${amount.toFixed(2)}`
  }
}
