import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge ships with zero knowledge of the Asimetrix DS's custom @theme scale. Its
 * `text-color` group matcher accepts *any* word as a plausible theme color name — so unknown
 * classes like `text-sm-tight` or `text-micro` (real DS font-size tokens, not colors) get
 * bucketed there too. When a size class and a color class both land in "text-color", tailwind-
 * merge dedupes the group and silently drops whichever one came first — e.g.
 * `cn("text-sm-tight text-fg")` was quietly losing `text-sm-tight`, leaving every element that
 * combined a DS font-size token with a DS text-color token stuck at the browser/body default
 * size instead of the intended one (this is what made the tables render with oversized text).
 * Registering the DS's actual custom font-size tokens under `font-size` fixes the group they're
 * deduped against.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-4xs", "text-3xs", "text-2xs", "text-micro", "text-sm-tight",
        "text-body-sm", "text-subhead", "text-heading-md", "text-heading-lg",
        "text-display-hero", "text-hero", "text-hero-sm",
      ],
    },
  },
});

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
