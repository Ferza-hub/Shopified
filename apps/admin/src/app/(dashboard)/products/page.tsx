'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { fetcher } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge, statusVariant } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';

type ProductStatus = 'ALL' | 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

interface Product {
  id: string;
  title: string;
  status: string;
  variants?: Array<{ price: number }>;
  totalInventory?: number;
  inventoryQuantity?: number;
  createdAt?: string;
}

const STATUS_TABS: { label: string; value: ProductStatus }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Archived', value: 'ARCHIVED' },
];

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <span className="font-medium text-slate-900">{row.original.title}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={statusVariant(row.original.status)}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const price = row.original.variants?.[0]?.price ?? 0;
      return <span>{formatCurrency(price)}</span>;
    },
  },
  {
    id: 'inventory',
    header: 'Inventory',
    cell: ({ row }) => {
      const qty = row.original.totalInventory ?? row.original.inventoryQuantity ?? 0;
      return <span>{qty} in stock</span>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => <span>{formatDate(row.original.createdAt ?? '')}</span>,
  },
];

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus>('ALL');

  const { data, isLoading } = useSWR('/products?page=1&limit=20', fetcher);

  const products: Product[] = useMemo(() => {
    const raw = Array.isArray(data) ? data : (data as { products?: Product[] })?.products ?? [];
    let filtered = raw;
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((p) => p.title.toLowerCase().includes(q));
    }
    return filtered;
  }, [data, statusFilter, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
        <Link href="/products/new" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus className="h-4 w-4" />
          Add product
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="flex rounded-lg border border-slate-200 bg-white p-1">
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
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      ) : (
        <DataTable
          columns={columns}
          data={products}
          emptyMessage="No products found."
        />
      )}
    </div>
  );
}
