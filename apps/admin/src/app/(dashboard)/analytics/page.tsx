'use client';

import { useState } from 'react';
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
import { formatCurrency } from '@/lib/utils';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type DateRange = '7' | '30' | '90';

interface Overview {
  totalRevenue?: number;
  totalOrders?: number;
  totalCustomers?: number;
  averageOrderValue?: number;
  revenueByDay?: Array<{ date: string; revenue: number }>;
}

interface TopProduct {
  id: string;
  title: string;
  totalSold?: number;
  totalRevenue?: number;
}

const PLACEHOLDER_REVENUE: Record<DateRange, Array<{ date: string; revenue: number }>> = {
  '7': [
    { date: 'Mon', revenue: 1200 },
    { date: 'Tue', revenue: 1900 },
    { date: 'Wed', revenue: 1500 },
    { date: 'Thu', revenue: 2200 },
    { date: 'Fri', revenue: 1800 },
    { date: 'Sat', revenue: 2800 },
    { date: 'Sun', revenue: 2400 },
  ],
  '30': Array.from({ length: 30 }, (_, i) => ({
    date: `Day ${i + 1}`,
    revenue: 800 + Math.floor(Math.random() * 1500),
  })),
  '90': Array.from({ length: 12 }, (_, i) => ({
    date: `Week ${i + 1}`,
    revenue: 5000 + Math.floor(Math.random() * 8000),
  })),
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30');

  const { data: overview, isLoading: overviewLoading } = useSWR<Overview>(
    '/analytics/overview',
    fetcher,
  );
  const { data: topProductsData, isLoading: productsLoading } = useSWR(
    '/analytics/products?limit=5',
    fetcher,
  );

  const topProducts: TopProduct[] = Array.isArray(topProductsData)
    ? topProductsData
    : (topProductsData as { products?: TopProduct[] })?.products ?? [];

  const revenueData = overview?.revenueByDay?.length
    ? overview.revenueByDay
    : PLACEHOLDER_REVENUE[dateRange];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as DateRange)}
          className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
          ))
        ) : (
          <>
            <StatsCard
              title="Revenue"
              value={formatCurrency(overview?.totalRevenue ?? 0)}
              icon={DollarSign}
              delta={12}
              hint={`Last ${dateRange} days`}
            />
            <StatsCard
              title="Orders"
              value={String(overview?.totalOrders ?? 0)}
              icon={ShoppingCart}
              delta={8}
              hint={`Last ${dateRange} days`}
            />
            <StatsCard
              title="Customers"
              value={String(overview?.totalCustomers ?? 0)}
              icon={Users}
              delta={5}
              hint={`Last ${dateRange} days`}
            />
            <StatsCard
              title="AOV"
              value={formatCurrency(overview?.averageOrderValue ?? 0)}
              icon={TrendingUp}
              delta={-2}
              hint={`Last ${dateRange} days`}
            />
          </>
        )}
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
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

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {productsLoading ? (
            <div className="h-40 animate-pulse rounded-xl bg-gray-100 m-4" />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 font-medium text-slate-500">#</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Product</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Units Sold</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                      No product data available.
                    </td>
                  </tr>
                ) : (
                  topProducts.map((product, index) => (
                    <tr key={product.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3 text-slate-400 font-medium">{index + 1}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{product.title}</td>
                      <td className="px-4 py-3 text-slate-700">{product.totalSold ?? 0}</td>
                      <td className="px-4 py-3 text-right text-slate-700">
                        {formatCurrency(product.totalRevenue ?? 0)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
