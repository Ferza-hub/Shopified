/**
 * Round a monetary value to 2 decimal places, avoiding floating point drift.
 */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatMoney(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

export function calculatePercentage(amount: number, percentage: number): number {
  return roundMoney((amount * percentage) / 100);
}

export function sum(values: number[]): number {
  return roundMoney(values.reduce((acc, v) => acc + v, 0));
}
