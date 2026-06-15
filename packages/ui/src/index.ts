/**
 * @shopified/ui — shared UI primitives.
 *
 * Concrete components live in each Next.js app for now; this package exposes
 * shared helpers and a className utility that both admin and storefront use.
 */

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export const UI_VERSION = '0.1.0';
