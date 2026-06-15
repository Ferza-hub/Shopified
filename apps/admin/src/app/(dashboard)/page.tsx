'use client';

import useSWR from 'swr';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { fetcher } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatsCard } from '@/components/ui/stats-card';
import { DataTable } from '@/components/ui/data-table';
import { Badge, statusVariant } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ColumnDef } from '@tanstack/react-table';

interface OverviewData {
  totalRevenue?: number;
  totalOrders?: number;
  totalCustomers?: number;
  averageOrderValue?: number;
  revenueByDay?: Array<{ date: string; revenue: number }>;
}

interface Order {
  id: string;
  name?: string;
  number?: number;
  customer?: { firstName?: string; lastName?: string; email?: string };
  totalPrice?: number;
  financialStatus?: string;
  createdAt?: string;
}

const FALLBACK_REVENUE_DATA = [
  { date: 'Mon', revenue: 1200 },
  { date: 'Tue', revenue: 1900 },
  { date: 'Wed', revenue: 1500 },
  { date: 'Thu', revenue: 2200 },
  { date: 'Fri', revenue: 1800 },
  { date: 'Sat', revenue: 2800 },
  { date: 'Sun', revenue: 2400 },
];

const orderColumns: ColumnDef<Order>[] = [
  {
    accessorKey: 'name',
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
      if (!c) return <span className="text-slate-400">—</span>;
      const name = [c.firstName, c.lastName].filter(Boolean).join(' ') || c.email || '—';
      return <span>{name}</span>;
    },
  },
  {
    accessorKey: 'totalPrice',
    header: 'Total',
    cell: ({ row }) => (
      <span>{formatCurrency(row.original.totalPrice ?? 0)}</span>
    ),
  },
  {
    accessorKey: 'financialStatus',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={statusVariant(row.original.financialStatus)}>
        {row.original.financialStatus ?? '—'}
      </Badge>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => <span>{formatDate(row.original.createdAt ?? '')}</span>,
  },
];

export default function DashboardPage() {
  const { data: overview, isLoading: overviewLoading } = useSWR<OverviewData>(
    '/analytics/overview',
    fetcher,
  );
  const { data: ordersData, isLoading: ordersLoading } = useSWR(
    '/orders?limit=5&page=1',
    fetcher,
  );

  const orders: Order[] = Array.isArray(ordersData)
    ? ordersData
    : (ordersData as { orders?: Order[] })?.orders ?? [];

  const revenueData =
    overview?.revenueByDay?.length
      ? overview.revenueByDay.map((d) => ({ date: d.date, revenue: d.revenue }))
      : FALLBACK_REVENUE_DATA;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Welcome back. Here is what is happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
          ))
        ) : (
          <>
            <StatsCard
              title="Total Revenue"
              value={formatCurrency(overview?.totalRevenue ?? 0)}
              icon={DollarSign}
              delta={12}
              hint="vs last month"
            />
            <StatsCard
              title="Orders"
              value={String(overview?.totalOrders ?? 0)}
              icon={ShoppingCart}
              delta={8}
              hint="vs last month"
            />
            <StatsCard
              title="Customers"
              value={String(overview?.totalCustomers ?? 0)}
              icon={Users}
              delta={5}
              hint="vs last month"
            />
            <StatsCard
              title="Avg Order Value"
              value={formatCurrency(overview?.averageOrderValue ?? 0)}
              icon={TrendingUp}
              delta={-2}
              hint="vs last month"
            />
          </>
        )}
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                contentStyle={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-slate-900">Recent Orders</h2>
        {ordersLoading ? (
          <div className="h-40 animate-pulse rounded-xl bg-gray-100" />
        ) : (
          <DataTable
            columns={orderColumns}
            data={orders.slice(0, 5)}
            emptyMessage="No recent orders found."
            pageSize={5}
          />
        )}
      </div>
    </div>
  );
}
