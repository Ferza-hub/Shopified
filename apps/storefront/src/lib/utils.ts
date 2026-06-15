import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cn as baseCn } from '@shopified/ui';
import { formatMoney } from '@shopified/shared';

/**
 * Tailwind-aware className combiner. We prefer twMerge here (so conflicting
 * utility classes resolve correctly) while still re-exporting the shared cn.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export { baseCn };

export function formatPrice(amount: number, currency = 'USD'): string {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return formatMoney(0, currency);
  return formatMoney(amount, currency);
}

export function lowestVariantPrice(prices: Array<number | null | undefined>): number {
  const valid = prices.filter((p): p is number => typeof p === 'number');
  if (valid.length === 0) return 0;
  return Math.min(...valid);
}

export function truncate(text: string, max = 120): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

export function imageOrPlaceholder(url?: string | null): string {
  return url && url.length > 0 ? url : PLACEHOLDER;
}
