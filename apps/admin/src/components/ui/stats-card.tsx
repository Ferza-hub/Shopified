import { type LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './card';

export interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  delta?: number;
  hint?: string;
}

export function StatsCard({ title, value, icon: Icon, delta, hint }: StatsCardProps) {
  const hasDelta = typeof delta === 'number';
  const positive = (delta ?? 0) >= 0;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {(hasDelta || hint) && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {hasDelta && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-medium',
                positive ? 'text-emerald-600' : 'text-red-600',
              )}
            >
              {positive ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {Math.abs(delta as number)}%
            </span>
          )}
          {hint && <span className="text-slate-400">{hint}</span>}
        </div>
      )}
    </Card>
  );
}
