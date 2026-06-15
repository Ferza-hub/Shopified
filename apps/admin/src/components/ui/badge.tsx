import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  danger: 'bg-red-50 text-red-700 ring-red-600/20',
  info: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-500/20',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

/**
 * Map a domain status string to a badge variant.
 */
export function statusVariant(status?: string): BadgeVariant {
  switch ((status ?? '').toLowerCase()) {
    case 'paid':
    case 'fulfilled':
    case 'completed':
    case 'active':
    case 'published':
    case 'delivered':
      return 'success';
    case 'pending':
    case 'processing':
    case 'partially_fulfilled':
    case 'draft':
      return 'warning';
    case 'cancelled':
    case 'refunded':
    case 'failed':
    case 'archived':
    case 'unfulfilled':
      return 'danger';
    case 'shipped':
    case 'authorized':
      return 'info';
    default:
      return 'neutral';
  }
}
