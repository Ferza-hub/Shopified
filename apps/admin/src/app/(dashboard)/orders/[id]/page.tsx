'use client';

import useSWR from 'swr';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { fetcher, post } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge, statusVariant } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LineItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
  image?: string | null;
  variantTitle?: string | null;
}

interface OrderDetail {
  id: string;
  name?: string;
  number?: number;
  createdAt?: string;
  financialStatus?: string;
  fulfillmentStatus?: string;
  lineItems?: LineItem[];
  subtotalPrice?: number;
  shippingPrice?: number;
  totalTax?: number;
  totalPrice?: number;
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    zip?: string;
    country?: string;
  };
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, mutate } = useSWR<OrderDetail>(
    id ? `/orders/${id}` : null,
    fetcher,
  );
  const [fulfilling, setFulfilling] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  async function handleFulfill() {
    setFulfilling(true);
    try {
      await post(`/orders/${id}/fulfill`, {});
      toast.success('Order fulfilled');
      mutate();
    } catch {
      toast.error('Failed to fulfill order');
    } finally {
      setFulfilling(false);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      await post(`/orders/${id}/cancel`, {});
      toast.success('Order cancelled');
      mutate();
    } catch {
      toast.error('Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-48 animate-pulse rounded-xl bg-gray-100" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="h-40 animate-pulse rounded-xl bg-gray-100 lg:col-span-2" />
          <div className="h-40 animate-pulse rounded-xl bg-gray-100" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        Order not found.
      </div>
    );
  }

  const sa = order.shippingAddress;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {order.name ?? `Order #${order.number}`}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{formatDate(order.createdAt ?? '')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusVariant(order.financialStatus)}>
            {order.financialStatus ?? '—'}
          </Badge>
          <Badge variant={statusVariant(order.fulfillmentStatus)}>
            {order.fulfillmentStatus ?? 'unfulfilled'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFulfill}
            disabled={fulfilling}
          >
            {fulfilling ? 'Fulfilling...' : 'Fulfill Order'}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left">
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 font-medium text-slate-500">Product</th>
                    <th className="px-4 py-3 font-medium text-slate-500">Qty</th>
                    <th className="px-4 py-3 font-medium text-slate-500 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.lineItems ?? []).map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gray-100" />
                          <div>
                            <p className="font-medium text-slate-900">{item.title}</p>
                            {item.variantTitle && (
                              <p className="text-xs text-slate-500">{item.variantTitle}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-slate-700">
                        {formatCurrency(item.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Order Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span>{formatCurrency(order.subtotalPrice ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Shipping</span>
                  <span>{formatCurrency(order.shippingPrice ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tax</span>
                  <span>{formatCurrency(order.totalTax ?? 0)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold text-slate-900">
                  <span>Total</span>
                  <span>{formatCurrency(order.totalPrice ?? 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              {order.customer ? (
                <>
                  <p className="font-medium text-slate-900">
                    {[order.customer.firstName, order.customer.lastName].filter(Boolean).join(' ') || '—'}
                  </p>
                  <p className="text-slate-500">{order.customer.email ?? '—'}</p>
                </>
              ) : (
                <p className="text-slate-400">No customer info</p>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              {sa ? (
                <>
                  <p className="font-medium text-slate-900">
                    {[sa.firstName, sa.lastName].filter(Boolean).join(' ')}
                  </p>
                  {sa.address1 && <p className="text-slate-600">{sa.address1}</p>}
                  {sa.address2 && <p className="text-slate-600">{sa.address2}</p>}
                  <p className="text-slate-600">
                    {[sa.city, sa.province, sa.zip].filter(Boolean).join(', ')}
                  </p>
                  {sa.country && <p className="text-slate-600">{sa.country}</p>}
                </>
              ) : (
                <p className="text-slate-400">No shipping address</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
