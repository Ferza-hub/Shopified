'use client';

import { useState, useMemo } from 'react';
import ProductCard from '@/components/product/product-card';

const SAMPLE_PRODUCTS = [
  { id: '1', handle: 'classic-tee', title: 'Classic Cotton Tee', price: 29.99, compareAtPrice: 39.99, badge: 'Sale', available: true },
  { id: '2', handle: 'slim-chinos', title: 'Slim Fit Chinos', price: 59.99, badge: 'New', available: true },
  { id: '3', handle: 'canvas-sneakers', title: 'Canvas Sneakers', price: 79.99, compareAtPrice: 99.99, available: true },
  { id: '4', handle: 'leather-wallet', title: 'Leather Wallet', price: 49.99, badge: 'Bestseller', available: true },
  { id: '5', handle: 'wool-scarf', title: 'Merino Wool Scarf', price: 39.99, available: true },
  { id: '6', handle: 'denim-jacket', title: 'Denim Jacket', price: 89.99, compareAtPrice: 119.99, badge: 'Sale', available: true },
  { id: '7', handle: 'linen-shirt', title: 'Linen Shirt', price: 45.99, available: false },
  { id: '8', handle: 'running-shorts', title: 'Running Shorts', price: 34.99, available: true },
  { id: '9', handle: 'baseball-cap', title: 'Baseball Cap', price: 24.99, available: true },
];

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export default function ProductsPage() {
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>('featured');

  const filtered = useMemo(() => {
    let products = [...SAMPLE_PRODUCTS];

    if (availableOnly) products = products.filter((p) => p.available);
    if (minPrice) products = products.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) products = products.filter((p) => p.price <= Number(maxPrice));

    if (sort === 'price-asc') products.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') products.sort((a, b) => b.price - a.price);

    return products;
  }, [minPrice, maxPrice, availableOnly, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">All Products</h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-56 lg:shrink-0">
          <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Price Range</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                />
                <span className="text-slate-400">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Availability</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-700">In stock only</span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => { setMinPrice(''); setMaxPrice(''); setAvailableOnly(false); }}
              className="text-xs text-indigo-600 hover:text-indigo-500"
            >
              Clear all filters
            </button>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">{filtered.length} products</p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500 font-medium">No products match your filters</p>
              <button
                type="button"
                onClick={() => { setMinPrice(''); setMaxPrice(''); setAvailableOnly(false); }}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
