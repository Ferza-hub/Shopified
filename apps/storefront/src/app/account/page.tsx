'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, LogOut } from 'lucide-react';
import { apiGet } from '@/lib/api';

interface Order {
  id: string;
  orderNumber: number;
  status: string;
  totalPrice: number;
  createdAt: string;
  lineItems: { id: string; title?: string; quantity: number }[];
}

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('storefront_token');
    if (!token) { router.replace('/account/login'); return; }

    Promise.all([
      apiGet<any>('/storefront/customers/me'),
      apiGet<any[]>('/storefront/customers/me/orders'),
    ])
      .then(([cust, ords]) => {
        setCustomer(cust);
        setOrders(Array.isArray(ords) ? ords : []);
      })
      .catch(() => {
        localStorage.removeItem('storefront_token');
        router.replace('/account/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  function handleLogout() {
    localStorage.removeItem('storefront_token');
    router.push('/');
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 mb-8" />
        {[1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100 mb-4" />)}
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hi, {customer.firstName}!</h1>
          <p className="text-sm text-slate-500">{customer.email}</p>
        </div>
        <button type="button" onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-slate-900">Order History</h2>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-16 text-center">
          <Package className="mb-3 h-10 w-10 text-slate-300" />
          <p className="font-medium text-slate-500">No orders yet</p>
          <Link href="/products" className="mt-3 text-sm text-indigo-600 hover:text-indigo-500">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">Order #{order.orderNumber}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    order.status === 'FULFILLED' ? 'bg-green-100 text-green-700'
                    : order.status === 'CANCELLED' ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700'
                  }`}>
                    {order.status}
                  </span>
                  <p className="mt-1 text-sm font-semibold text-slate-900">${Number(order.totalPrice).toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-3 text-sm text-slate-500">
                {order.lineItems.slice(0, 3).map((li) => (
                  <span key={li.id} className="mr-2">{li.quantity}× {li.title ?? 'Item'}</span>
                ))}
                {order.lineItems.length > 3 && <span>+{order.lineItems.length - 3} more</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
