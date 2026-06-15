'use client';

import { useParams } from 'next/navigation';
import ProductCard from '@/components/product/product-card';

const COLLECTION_PRODUCTS = [
  { id: '1', handle: 'classic-tee', title: 'Classic Cotton Tee', price: 29.99, compareAtPrice: 39.99, badge: 'Sale' },
  { id: '2', handle: 'slim-chinos', title: 'Slim Fit Chinos', price: 59.99 },
  { id: '3', handle: 'canvas-sneakers', title: 'Canvas Sneakers', price: 79.99, compareAtPrice: 99.99 },
  { id: '4', handle: 'leather-wallet', title: 'Leather Wallet', price: 49.99, badge: 'Bestseller' },
  { id: '5', handle: 'wool-scarf', title: 'Merino Wool Scarf', price: 39.99 },
  { id: '6', handle: 'denim-jacket', title: 'Denim Jacket', price: 89.99, compareAtPrice: 119.99, badge: 'Sale' },
];

function formatCollectionTitle(handle: string): string {
  return handle
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function CollectionPage() {
  const { handle } = useParams<{ handle: string }>();
  const title = formatCollectionTitle(handle ?? 'collection');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {COLLECTION_PRODUCTS.length} products
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {COLLECTION_PRODUCTS.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
}
