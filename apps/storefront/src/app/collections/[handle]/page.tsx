'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductCard from '@/components/product/product-card';
import { apiGet } from '@/lib/api';
import { sampleCollectionByHandle } from '@/lib/sample-data';

interface CardProduct {
  id: string;
  handle: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
}

export default function CollectionPage() {
  const { handle } = useParams<{ handle: string }>();

  const fallback = handle ? sampleCollectionByHandle(handle) : undefined;
  const [title, setTitle] = useState(fallback?.title ?? (handle ?? 'Collection'));
  const [description, setDescription] = useState(fallback?.description ?? '');
  const [products, setProducts] = useState<CardProduct[]>(
    fallback?.products.map((p) => ({
      id: p.id, handle: p.handle, title: p.title,
      price: p.price ?? 0, image: p.images[0]?.url,
    })) ?? [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!handle) return;
    apiGet<any>(`/storefront/collections/${handle}`)
      .then((col) => {
        setTitle(col.title);
        setDescription(col.description ?? '');
        const mapped: CardProduct[] = (col.products ?? [])
          .filter((cp: any) => cp.product)
          .map((cp: any) => {
            const p = cp.product;
            const v = p.variants?.[0];
            return {
              id: p.id,
              handle: p.handle,
              title: p.title,
              price: v ? Number(v.price) : 0,
              compareAtPrice: v?.compareAtPrice ? Number(v.compareAtPrice) : undefined,
              image: p.images?.[0]?.url,
            };
          });
        setProducts(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [handle]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        {description && <p className="mt-2 text-slate-500">{description}</p>}
        <p className="mt-1 text-sm text-slate-400">{loading ? '…' : `${products.length} products`}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-72 animate-pulse rounded-xl bg-gray-100" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-500">No products in this collection yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </div>
  );
}
