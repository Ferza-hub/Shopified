'use client';

import { useState, useMemo, useEffect } from 'react';
import ProductCard from '@/components/product/product-card';
import { apiGet } from '@/lib/api';
import { sampleProducts } from '@/lib/sample-data';

interface CardProduct {
  id: string;
  handle: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
}

function fromApi(p: any): CardProduct {
  const v = p.variants?.[0];
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    price: v ? Number(v.price) : 0,
    compareAtPrice: v?.compareAtPrice ? Number(v.compareAtPrice) : undefined,
    image: p.images?.[0]?.url,
  };
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<CardProduct[]>(
    sampleProducts.map((p) => ({
      id: p.id, handle: p.handle, title: p.title,
      price: p.price ?? 0, compareAtPrice: p.compareAtPrice ?? undefined,
      image: p.images[0]?.url,
    })),
  );
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState<SortOption>('featured');

  useEffect(() => {
    apiGet<{ products: any[] }>('/storefront/products?limit=100')
      .then((res) => { if (res.products?.length) setAllProducts(res.products.map(fromApi)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...allProducts];
    if (minPrice) list = list.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) list = list.filter((p) => p.price <= Number(maxPrice));
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    return list;
  }, [allProducts, minPrice, maxPrice, sort]);

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
                <input type="number" placeholder="Min" value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-indigo-500 focus:outline-none" />
                <span className="text-slate-400">—</span>
                <input type="number" placeholder="Max" value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
            </div>
            <button type="button"
              onClick={() => { setMinPrice(''); setMaxPrice(''); }}
              className="text-xs text-indigo-600 hover:text-indigo-500">
              Clear filters
            </button>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {loading ? 'Loading…' : `${filtered.length} products`}
            </p>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)}
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-indigo-500 focus:outline-none">
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-72 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500 font-medium">No products found</p>
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
