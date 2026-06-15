'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { fetcher } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge, statusVariant } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';

interface Discount {
  id: string;
  code: string;
  type?: string;
  valueType?: string;
  value?: number;
  usageCount?: number;
  usageLimit?: number;
  status?: string;
  startsAt?: string;
  endsAt?: string | null;
}

const columns: ColumnDef<Discount>[] = [
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => (
      <span className="font-mono font-medium text-slate-900">{row.original.code}</span>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => (
      <span className="text-slate-600 capitalize">{(row.original.type ?? '').toLowerCase()}</span>
    ),
  },
  {
    id: 'value',
    header: 'Value',
    cell: ({ row }) => {
      const vt = row.original.valueType;
      const v = row.original.value ?? 0;
      if (vt === 'PERCENTAGE') return <span>{v}%</span>;
      if (vt === 'FIXED_AMOUNT') return <span>${v.toFixed(2)}</span>;
      return <span>Free Shipping</span>;
    },
  },
  {
    id: 'usage',
    header: 'Usage',
    cell: ({ row }) => {
      const used = row.original.usageCount ?? 0;
      const limit = row.original.usageLimit;
      return (
        <span>
          {used}
          {limit != null ? ` / ${limit}` : ''}
        </span>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={statusVariant(row.original.status ?? 'active')}>
        {row.original.status ?? 'active'}
      </Badge>
    ),
  },
  {
    id: 'dates',
    header: 'Dates',
    cell: ({ row }) => (
      <span className="text-slate-600 text-xs">
        {formatDate(row.original.startsAt ?? '')}
        {row.original.endsAt ? ` → ${formatDate(row.original.endsAt)}` : ''}
      </span>
    ),
  },
];

export default function DiscountsPage() {
  const { data, isLoading } = useSWR('/discounts', fetcher);

  const discounts: Discount[] = Array.isArray(data)
    ? data
    : (data as { discounts?: Discount[] })?.discounts ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Discounts</h1>
        <Link href="/discounts/new" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus className="h-4 w-4" />
          Create discount
        </Link>
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      ) : discounts.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 text-center">
          <p className="text-slate-500 font-medium">No discounts yet</p>
          <p className="text-sm text-slate-400 mt-1">Create a discount code to offer deals to your customers.</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={discounts}
          emptyMessage="No discounts found."
        />
      )}
    </div>
  );
}
