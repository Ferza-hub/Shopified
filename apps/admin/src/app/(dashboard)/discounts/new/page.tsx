'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import axios from 'axios';
import { post } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';

interface DiscountForm {
  code: string;
  type: 'CODE' | 'AUTOMATIC';
  valueType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  value: string;
  minimumPurchaseAmount: string;
  usageLimit: string;
  startsAt: string;
  endsAt: string;
}

const INITIAL: DiscountForm = {
  code: '',
  type: 'CODE',
  valueType: 'PERCENTAGE',
  value: '',
  minimumPurchaseAmount: '',
  usageLimit: '',
  startsAt: '',
  endsAt: '',
};

export default function NewDiscountPage() {
  const router = useRouter();
  const [form, setForm] = useState<DiscountForm>(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof DiscountForm>(key: K, value: DiscountForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.code.trim()) {
      toast.error('Discount code is required');
      return;
    }
    setSubmitting(true);
    try {
      await post('/discounts', {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        valueType: form.valueType,
        value: form.value ? Number(form.value) : undefined,
        minimumPurchaseAmount: form.minimumPurchaseAmount
          ? Number(form.minimumPurchaseAmount)
          : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        startsAt: form.startsAt || undefined,
        endsAt: form.endsAt || undefined,
      });
      toast.success('Discount created');
      router.push('/discounts');
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? error.message)
        : 'Failed to create discount';
      toast.error(Array.isArray(message) ? message.join(', ') : String(message));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Create discount</h1>
        <p className="mt-1 text-sm text-slate-500">Set up a new discount code or automatic discount</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Discount details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="code">Discount Code</Label>
                <Input
                  id="code"
                  value={form.code}
                  onChange={(e) => update('code', e.target.value)}
                  placeholder="SUMMER20"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  value={form.type}
                  onChange={(e) => update('type', e.target.value as DiscountForm['type'])}
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="CODE">Code</option>
                  <option value="AUTOMATIC">Automatic</option>
                </select>
              </div>

              <div>
                <Label htmlFor="valueType">Value Type</Label>
                <select
                  id="valueType"
                  value={form.valueType}
                  onChange={(e) => update('valueType', e.target.value as DiscountForm['valueType'])}
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED_AMOUNT">Fixed Amount</option>
                  <option value="FREE_SHIPPING">Free Shipping</option>
                </select>
              </div>

              {form.valueType !== 'FREE_SHIPPING' && (
                <div>
                  <Label htmlFor="value">
                    Value {form.valueType === 'PERCENTAGE' ? '(%)' : '($)'}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    min={0}
                    step={form.valueType === 'PERCENTAGE' ? '1' : '0.01'}
                    value={form.value}
                    onChange={(e) => update('value', e.target.value)}
                    placeholder={form.valueType === 'PERCENTAGE' ? '10' : '5.00'}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="minimumPurchaseAmount">Minimum Purchase Amount (optional)</Label>
                <Input
                  id="minimumPurchaseAmount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.minimumPurchaseAmount}
                  onChange={(e) => update('minimumPurchaseAmount', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="usageLimit">Usage Limit (optional)</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  min={0}
                  step="1"
                  value={form.usageLimit}
                  onChange={(e) => update('usageLimit', e.target.value)}
                  placeholder="Unlimited"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Dates</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="startsAt">Start Date</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => update('startsAt', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endsAt">End Date (optional)</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => update('endsAt', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {form.code && (
                <p className="font-mono text-sm font-medium text-slate-900">
                  {form.code.toUpperCase()}
                </p>
              )}
              <p className="text-sm text-slate-500">
                {form.type === 'CODE' ? 'Manual code' : 'Applied automatically'}
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create discount'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/discounts')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
