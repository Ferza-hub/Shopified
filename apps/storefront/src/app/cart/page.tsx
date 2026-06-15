'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCartStore, selectSubtotal } from '@/lib/cart-store';
import CartItem from '@/components/cart/cart-item';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectSubtotal);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);

  const shipping = subtotal >= 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const discount = discountApplied ? subtotal * 0.1 : 0;
  const total = subtotal - discount + shipping + tax;

  function handleApplyDiscount() {
    if (discountCode.trim().toUpperCase() === 'SAVE10') {
      setDiscountApplied(true);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <ShoppingBag className="h-16 w-16 text-slate-300" />
          <h1 className="text-2xl font-bold text-slate-900">Your cart is empty</h1>
          <p className="text-sm text-slate-500">Add items from the store to get started.</p>
          <Link
            href="/products"
            className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-slate-900 px-8 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-slate-900">Shopping Cart</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <CartItem key={item.key} item={item} />
          ))}
          <Link
            href="/products"
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            &larr; Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              {discountApplied && (
                <div className="flex justify-between text-green-600">
                  <span>Discount (SAVE10)</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-600">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tax (8%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Discount */}
            {!discountApplied && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Discount code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="h-9 flex-1 rounded-lg border border-slate-300 px-3 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  className="h-9 rounded-lg bg-slate-100 px-4 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                  Apply
                </button>
              </div>
            )}

            {shipping > 0 && (
              <p className="text-xs text-slate-500">
                Add ${(50 - subtotal).toFixed(2)} more for free shipping
              </p>
            )}

            <Link
              href="/checkout"
              className="flex h-12 w-full items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
