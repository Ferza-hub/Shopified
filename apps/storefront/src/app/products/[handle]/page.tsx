'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Star, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import ProductGallery from '@/components/product/product-gallery';
import VariantSelector from '@/components/product/variant-selector';
import { apiGet } from '@/lib/api';
import { sampleProductByHandle } from '@/lib/sample-data';
import type { Product } from '@/lib/types';

interface Review {
  id: string;
  authorName: string;
  rating: number;
  body?: string | null;
  createdAt: string;
}

function toStorefrontProduct(raw: any): Product {
  return {
    id: raw.id,
    title: raw.title,
    handle: raw.handle,
    description: raw.description,
    productType: raw.productType,
    vendor: raw.vendor,
    tags: raw.tags ?? [],
    images: (raw.images ?? []).map((img: any) => ({
      id: img.id,
      url: img.url,
      altText: img.altText,
      position: img.position,
    })),
    options: (raw.options ?? []).map((opt: any) => ({
      id: opt.id,
      name: opt.name,
      position: opt.position,
      values: opt.values ?? [],
    })),
    variants: (raw.variants ?? []).map((v: any) => ({
      id: v.id,
      title: v.title,
      sku: v.sku,
      price: Number(v.price),
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
      available: true,
      selectedOptions: [],
    })),
    price: raw.variants?.[0] ? Number(raw.variants[0].price) : 0,
    compareAtPrice: raw.variants?.[0]?.compareAtPrice
      ? Number(raw.variants[0].compareAtPrice)
      : null,
  };
}

export default function ProductPage() {
  const { handle } = useParams<{ handle: string }>();
  const addItem = useCartStore((s) => s.addItem);

  const fallback = handle ? sampleProductByHandle(handle) ?? null : null;
  const [product, setProduct] = useState<Product | null>(fallback);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (!handle) return;
    apiGet<any>(`/storefront/products/${handle}`)
      .then((raw) => {
        const p = toStorefrontProduct(raw);
        setProduct(p);
        const init: Record<string, string> = {};
        p.options.forEach((o) => { if (o.values[0]) init[o.name] = o.values[0]; });
        setSelectedOptions(init);
        setReviews(raw.reviews ?? []);
      })
      .catch(() => {
        if (fallback) {
          const init: Record<string, string> = {};
          fallback.options.forEach((o) => { if (o.values[0]) init[o.name] = o.values[0]; });
          setSelectedOptions(init);
        }
      })
      .finally(() => setLoading(false));
  }, [handle]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-xl bg-gray-100" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-10 animate-pulse rounded bg-gray-100" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-lg text-slate-500">Product not found.</p>
      </div>
    );
  }

  const variant = product.variants[0];
  const avgRating = reviews.length
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  function handleAddToCart() {
    if (!product || !variant) return;
    addItem(
      { id: product.id, title: product.title, handle: product.handle, image: product.images[0]?.url },
      { id: variant.id, title: variant.title, price: variant.price },
      quantity,
    );
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} title={product.title} />

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{product.title}</h1>
            {reviews.length > 0 && (
              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-slate-500">{avgRating.toFixed(1)} ({reviews.length} reviews)</span>
              </div>
            )}
          </div>

          {variant && (
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-slate-900">${variant.price.toFixed(2)}</span>
              {variant.compareAtPrice && (
                <>
                  <span className="text-lg text-slate-400 line-through">${variant.compareAtPrice.toFixed(2)}</span>
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                    Save ${(variant.compareAtPrice - variant.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>
          )}

          {product.options.length > 0 && (
            <VariantSelector
              options={product.options}
              selectedOptions={selectedOptions}
              onChange={(opt, val) => setSelectedOptions((prev) => ({ ...prev, [opt]: val }))}
            />
          )}

          <div>
            <p className="mb-2 text-sm font-medium text-slate-900">Quantity</p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 hover:bg-slate-50">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-sm font-medium">{quantity}</span>
              <button type="button" onClick={() => setQuantity((q) => q + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 hover:bg-slate-50">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button type="button" onClick={handleAddToCart}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">
            <ShoppingCart className="h-4 w-4" />
            {addedToCart ? 'Added to cart!' : 'Add to Cart'}
          </button>

          {product.description && (
            <div className="border-t border-slate-100 pt-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">Description</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {reviews.length > 0 && (
        <section className="mt-16 border-t border-slate-200 pt-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Customer Reviews ({reviews.length})</h2>
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{review.authorName}</p>
                    <div className="mt-1 flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
                {review.body && <p className="mt-3 text-sm text-slate-600">{review.body}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
