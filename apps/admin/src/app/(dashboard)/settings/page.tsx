'use client';

import { useState, useEffect, type FormEvent } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import axios from 'axios';
import { fetcher, patch } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';

type Tab = 'general' | 'notifications';

interface Store {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  currency?: string;
  timezone?: string;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR'];
const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    currency: 'USD',
    timezone: 'America/New_York',
  });

  const { data: storeData } = useSWR('/stores', fetcher);
  const store: Store | null = Array.isArray(storeData)
    ? (storeData[0] ?? null)
    : (storeData as Store | null);

  useEffect(() => {
    if (store) {
      setForm({
        name: store.name ?? '',
        email: store.email ?? '',
        phone: store.phone ?? '',
        currency: store.currency ?? 'USD',
        timezone: store.timezone ?? 'America/New_York',
      });
    }
  }, [store]);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!store?.id) {
      toast.error('Store not loaded');
      return;
    }
    setSubmitting(true);
    try {
      await patch(`/stores/${store.id}`, form);
      toast.success('Settings saved');
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? error.message)
        : 'Failed to save settings';
      toast.error(Array.isArray(message) ? message.join(', ') : String(message));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {(['general', 'notifications'] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm font-medium capitalize transition-colors',
              activeTab === tab
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-600 hover:text-slate-900',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Store Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="My Awesome Store"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="store@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  value={form.currency}
                  onChange={(e) => update('currency', e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  value={form.timezone}
                  onChange={(e) => update('timezone', e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save changes'}
          </Button>
        </form>
      )}

      {activeTab === 'notifications' && (
        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'New order received', description: 'Get notified when a customer places an order' },
                { label: 'Order fulfilled', description: 'When an order is marked as fulfilled' },
                { label: 'Low inventory alert', description: 'When a product drops below threshold' },
                { label: 'New customer signup', description: 'When a new customer creates an account' },
              ].map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="h-5 w-9 rounded-full bg-slate-200 peer-checked:bg-indigo-600 peer-focus:ring-2 peer-focus:ring-indigo-100 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
                  </label>
                </div>
              ))}
              <Button className="mt-4">Save preferences</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
