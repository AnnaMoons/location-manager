import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number with Spanish locale (decimal comma)
 * Example: 130.5 → "130,5"
 */
export function formatNumber(
  value: number,
  options?: {
    decimals?: number;
    locale?: string;
  }
): string {
  const { decimals = 1, locale = 'es-ES' } = options || {};
  return value.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format percentage with Spanish locale
 * Example: 0.975 → "97,5%"
 */
export function formatPercent(
  value: number,
  options?: {
    decimals?: number;
    locale?: string;
  }
): string {
  const { decimals = 1, locale = 'es-ES' } = options || {};
  return (value * 100).toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }) + '%';
}
