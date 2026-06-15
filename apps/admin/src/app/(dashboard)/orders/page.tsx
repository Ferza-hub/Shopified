'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { DataTable } from '@/components/ui/data-table';
import { Badge, statusVariant } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';

type StatusFilter = 'ALL' | 'UNFULFILLED' | 'UNPAID' | 'COMPLETED';

interface Order {
  id: string;
  name?: string;
  number?: number;
  customer?: { firstName?: string; lastName?: string; email?: string };
  createdAt?: string;
  financialStatus?: string;
  fulfillmentStatus?: string;
  totalPrice?: number;
}

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Unfulfilled', value: 'UNFULFILLED' },
  { label: 'Unpaid', value: 'UNPAID' },
  { label: 'Completed', value: 'COMPLETED' },
];

const columns: ColumnDef<Order>[] = [
  {
    id: 'orderNumber',
    header: 'Order #',
    cell: ({ row }) => (
      <span className="font-medium text-slate-900">
        {row.original.name ?? `#${row.original.number}`}
      </span>
    ),
  },
  {
    id: 'customer',
    header: 'Customer',
    cell: ({ row }) => {
      const c = row.original.customer;
      if (!c) return <span className="text-slate-400">Guest</span>;
      return (
        <span>{[c.firstName, c.lastName].filter(Boolean).join(' ') || c.email || 'Guest'}</span>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => <span>{formatDate(row.original.createdAt ?? '')}</span>,
  },
  {
    accessorKey: 'financialStatus',
    header: 'Payment',
    cell: ({ row }) => (
      <Badge variant={statusVariant(row.original.financialStatus)}>
        {row.original.financialStatus ?? '—'}
      </Badge>
    ),
  },
  {
    accessorKey: 'fulfillmentStatus',
    header: 'Fulfillment',
    cell: ({ row }) => (
      <Badge variant={statusVariant(row.original.fulfillmentStatus)}>
        {row.original.fulfillmentStatus ?? 'unfulfilled'}
      </Badge>
    ),
  },
  {
    accessorKey: 'totalPrice',
    header: 'Total',
    cell: ({ row }) => <span>{formatCurrency(row.original.totalPrice ?? 0)}</span>,
  },
];

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const { data, isLoading } = useSWR('/orders?page=1&limit=20', fetcher);

  const orders: Order[] = useMemo(() => {
    const raw = Array.isArray(data) ? data : (data as { orders?: Order[] })?.orders ?? [];
    if (statusFilter === 'ALL') return raw;
    if (statusFilter === 'UNFULFILLED')
      return raw.filter(
        (o) => !o.fulfillmentStatus || o.fulfillmentStatus.toLowerCase() === 'unfulfilled',
      );
    if (statusFilter === 'UNPAID')
      return raw.filter(
        (o) => o.financialStatus?.toLowerCase() === 'pending' || o.financialStatus?.toLowerCase() === 'unpaid',
      );
    if (statusFilter === 'COMPLETED')
      return raw.filter(
        (o) =>
          o.financialStatus?.toLowerCase() === 'paid' &&
          o.fulfillmentStatus?.toLowerCase() === 'fulfilled',
      );
    return raw;
  }, [data, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
      </div>

      <div className="flex rounded-lg border border-slate-200 bg-white p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              statusFilter === tab.value
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      ) : (
        <DataTable
          columns={columns}
          data={orders}
          emptyMessage="No orders found."
        />
      )}
    </div>
  );
}
