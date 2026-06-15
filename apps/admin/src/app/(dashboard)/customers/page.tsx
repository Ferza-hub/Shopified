'use client';

import useSWR from 'swr';
import { Plus } from 'lucide-react';
import { fetcher } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@tanstack/react-table';

interface Customer {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  totalOrders?: number;
  totalSpent?: number;
  createdAt?: string;
}

const columns: ColumnDef<Customer>[] = [
  {
    id: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const name =
        [row.original.firstName, row.original.lastName].filter(Boolean).join(' ') ||
        row.original.email;
      return <span className="font-medium text-slate-900">{name}</span>;
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <span className="text-slate-600">{row.original.email}</span>,
  },
  {
    accessorKey: 'totalOrders',
    header: 'Orders',
    cell: ({ row }) => <span>{row.original.totalOrders ?? 0}</span>,
  },
  {
    accessorKey: 'totalSpent',
    header: 'Spent',
    cell: ({ row }) => <span>{formatCurrency(row.original.totalSpent ?? 0)}</span>,
  },
  {
    accessorKey: 'createdAt',
    header: 'Joined',
    cell: ({ row }) => <span>{formatDate(row.original.createdAt ?? '')}</span>,
  },
];

export default function CustomersPage() {
  const { data, isLoading } = useSWR('/customers?page=1&limit=20', fetcher);

  const customers: Customer[] = Array.isArray(data)
    ? data
    : (data as { customers?: Customer[] })?.customers ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Customers</h1>
        <Button>
          <Plus className="h-4 w-4" />
          Add customer
        </Button>
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      ) : customers.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 text-center">
          <p className="text-slate-500 font-medium">No customers yet</p>
          <p className="text-sm text-slate-400 mt-1">Customers will appear here when orders come in.</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={customers}
          emptyMessage="No customers found."
        />
      )}
    </div>
  );
}
