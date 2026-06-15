'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, LogOut } from 'lucide-react';
import type { OrderSummary } from '@/lib/types';

const SAMPLE_ORDERS: OrderSummary[] = [];

export default function AccountPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('storefront_token');
    if (!token) {
      router.replace('/account/login');
    } else {
      setIsLoggedIn(true);
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem('storefront_token');
    router.push('/account/login');
  }

  if (isLoggedIn === null) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">My Account</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      {/* Order History */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-4">
          <Package className="h-5 w-5 text-slate-500" />
          <h2 className="text-base font-semibold text-slate-900">Order History</h2>
        </div>

        {SAMPLE_ORDERS.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Package className="h-12 w-12 text-slate-300" />
            <p className="font-medium text-slate-900">No orders yet</p>
            <p className="text-sm text-slate-500">
              When you place an order, it will appear here.
            </p>
            <Link
              href="/products"
              className="mt-2 inline-flex h-10 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {SAMPLE_ORDERS.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div>
                  <p className="font-medium text-slate-900">Order #{order.number}</p>
                  <p className="text-xs text-slate-500">{order.createdAt}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900">
                    ${order.total.toFixed(2)} {order.currency}
                  </p>
                  <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
