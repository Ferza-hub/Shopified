'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Lock } from 'lucide-react';
import { useCartStore, selectSubtotal } from '@/lib/cart-store';

type Step = 'contact' | 'shipping' | 'payment';
const STEPS: { id: Step; label: string }[] = [
  { id: 'contact', label: 'Contact' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'payment', label: 'Payment' },
];
const RATES = [
  { id: 'standard', name: 'Standard Shipping', price: 5.99, days: '5–7 business days' },
  { id: 'express', name: 'Express Shipping', price: 14.99, days: '2–3 business days' },
  { id: 'overnight', name: 'Overnight', price: 29.99, days: 'Next business day' },
];

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectSubtotal);
  const [step, setStep] = useState<Step>('contact');
  const [rate, setRate] = useState(RATES[0]);
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', address1: '', city: '', zip: '', country: 'US' });
  const total = subtotal + rate.price;
  const idx = STEPS.findIndex((s) => s.id === step);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <p className="text-gray-500 mb-4">Your cart is empty</p>
        <Link href="/products" className="font-medium text-black underline">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-gray-900">SHOPIFIED</Link>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-10 text-sm">
          {STEPS.map((s, i) => (
            <span key={s.id} className="flex items-center gap-2">
              <span className={`font-medium ${i <= idx ? 'text-black' : 'text-gray-400'}`}>{s.label}</span>
              {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300" />}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form panel */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm">
            {step === 'contact' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">Contact & Shipping</h2>
                {[
                  { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com', full: true },
                ].map(({ label, key, type, placeholder, full }) => (
                  <div key={key} className={full ? '' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input type={type || 'text'} value={(form as any)[key]} onChange={set(key)} placeholder={placeholder}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-4">
                  {['firstName', 'lastName'].map((k) => (
                    <div key={k}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{k === 'firstName' ? 'First name' : 'Last name'}</label>
                      <input value={(form as any)[k]} onChange={set(k)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input value={form.address1} onChange={set('address1')} placeholder="Street address"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input value={form.city} onChange={set('city')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                    <input value={form.zip} onChange={set('zip')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                  </div>
                </div>
                <button onClick={() => setStep('shipping')}
                  className="w-full bg-black text-white py-3.5 rounded-xl font-semibold hover:bg-gray-900 mt-2">
                  Continue to Shipping
                </button>
              </div>
            )}

            {step === 'shipping' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">Shipping Method</h2>
                {RATES.map((r) => (
                  <label key={r.id} className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer ${rate.id === r.id ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                    <input type="radio" name="rate" checked={rate.id === r.id} onChange={() => setRate(r)} className="sr-only" />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${rate.id === r.id ? 'border-black' : 'border-gray-300'}`}>
                      {rate.id === r.id && <div className="w-2 h-2 bg-black rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{r.name}</p>
                      <p className="text-xs text-gray-500">{r.days}</p>
                    </div>
                    <span className="text-sm font-semibold">${r.price.toFixed(2)}</span>
                  </label>
                ))}
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep('contact')} className="flex-1 border border-gray-300 py-3 rounded-xl font-medium text-sm">Back</button>
                  <button onClick={() => setStep('payment')} className="flex-1 bg-black text-white py-3 rounded-xl font-semibold text-sm">Continue to Payment</button>
                </div>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">Payment</h2>
                <div className="border border-gray-200 rounded-xl p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card number</label>
                    <input placeholder="1234 5678 9012 3456" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                      <input placeholder="MM / YY" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                      <input placeholder="123" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep('shipping')} className="flex-1 border border-gray-300 py-3 rounded-xl font-medium text-sm">Back</button>
                  <button className="flex-1 bg-black text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" /> Pay ${total.toFixed(2)}
                  </button>
                </div>
                <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1 mt-2">
                  <Lock className="w-3 h-3" /> Secured by SSL
                </p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.key} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                      {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
                      <span className="absolute -top-1 -right-1 bg-gray-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.title}</p>
                      {item.variantTitle !== 'Default Title' && <p className="text-xs text-gray-400">{item.variantTitle}</p>}
                    </div>
                    <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span>${rate.price.toFixed(2)}</span></div>
                <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t"><span>Total</span><span>${total.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
