'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { PRODUCT_STATUS } from '@shopified/shared';
import { post } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Label, Textarea } from '@/components/ui/input';

export interface ProductFormValues {
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  inventoryQuantity: number;
  status: keyof typeof PRODUCT_STATUS;
}

const STATUS_OPTIONS = Object.values(PRODUCT_STATUS);

const initialValues: ProductFormValues = {
  title: '',
  description: '',
  price: 0,
  compareAtPrice: undefined,
  sku: '',
  inventoryQuantity: 0,
  status: 'DRAFT',
};

export function ProductForm() {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(initialValues);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setSubmitting(true);
    try {
      await post('/products', {
        title: values.title.trim(),
        description: values.description.trim() || undefined,
        sku: values.sku.trim() || undefined,
        status: values.status,
        inventoryQuantity: Number(values.inventoryQuantity) || 0,
        variants: [
          {
            price: Number(values.price) || 0,
            compareAtPrice: values.compareAtPrice
              ? Number(values.compareAtPrice)
              : undefined,
            sku: values.sku.trim() || undefined,
            inventoryQuantity: Number(values.inventoryQuantity) || 0,
          },
        ],
      });
      toast.success('Product created');
      router.push('/products');
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? error.message)
        : 'Failed to create product';
      toast.error(Array.isArray(message) ? message.join(', ') : String(message));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Product details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={values.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="Short sleeve t-shirt"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={values.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="Describe your product..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing & inventory</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step="0.01"
                value={values.price}
                onChange={(e) => update('price', Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="compareAtPrice">Compare-at price</Label>
              <Input
                id="compareAtPrice"
                type="number"
                min={0}
                step="0.01"
                value={values.compareAtPrice ?? ''}
                onChange={(e) =>
                  update(
                    'compareAtPrice',
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
              />
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={values.sku}
                onChange={(e) => update('sku', e.target.value)}
                placeholder="TSHIRT-001"
              />
            </div>
            <div>
              <Label htmlFor="inventory">Inventory quantity</Label>
              <Input
                id="inventory"
                type="number"
                min={0}
                step="1"
                value={values.inventoryQuantity}
                onChange={(e) =>
                  update('inventoryQuantity', Number(e.target.value))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="status">Product status</Label>
              <select
                id="status"
                value={values.status}
                onChange={(e) =>
                  update('status', e.target.value as keyof typeof PRODUCT_STATUS)
                }
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Create product'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/products')}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
