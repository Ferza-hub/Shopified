'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Star, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import ProductGallery from '@/components/product/product-gallery';
import VariantSelector from '@/components/product/variant-selector';

interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

const SAMPLE_PRODUCT = {
  id: 'prod-1',
  handle: 'classic-tee',
  title: 'Classic Cotton Tee',
  description:
    'A timeless wardrobe essential crafted from 100% organic cotton. Soft, breathable, and built to last through countless washes while keeping its shape.',
  images: [
    { id: '1', url: '', altText: 'Classic Tee - Front' },
    { id: '2', url: '', altText: 'Classic Tee - Back' },
    { id: '3', url: '', altText: 'Classic Tee - Detail' },
  ],
  options: [
    { id: 'size', name: 'Size', values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'color', name: 'Color', values: ['White', 'Black', 'Navy', 'Gray'] },
  ],
  variants: [
    { id: 'v1', title: 'M / White', price: 29.99, compareAtPrice: 39.99, selectedOptions: [] },
  ],
  price: 29.99,
  compareAtPrice: 39.99,
};

const SAMPLE_REVIEWS: Review[] = [
  { id: 1, author: 'Alex M.', rating: 5, comment: 'Best tee I have ever owned. Super soft and fits perfectly.', date: 'May 2025' },
  { id: 2, author: 'Jordan K.', rating: 4, comment: 'Great quality. Runs slightly large so size down.', date: 'Apr 2025' },
  { id: 3, author: 'Sam R.', rating: 5, comment: 'Bought 3 of these. Absolutely love them.', date: 'Mar 2025' },
];

export default function ProductPage() {
  const { handle } = useParams<{ handle: string }>();
  const addItem = useCartStore((s) => s.addItem);

  const product = { ...SAMPLE_PRODUCT, handle: handle ?? SAMPLE_PRODUCT.handle };

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    product.options.forEach((o) => { if (o.values[0]) init[o.name] = o.values[0]; });
    return init;
  });
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const variant = product.variants[0];

  function handleOptionChange(option: string, value: string) {
    setSelectedOptions((prev) => ({ ...prev, [option]: value }));
  }

  function handleAddToCart() {
    addItem(
      { id: product.id, title: product.title, handle: product.handle, image: null },
      { id: variant.id, title: variant.title, price: variant.price },
      quantity,
    );
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  const avgRating = SAMPLE_REVIEWS.reduce((acc, r) => acc + r.rating, 0) / SAMPLE_REVIEWS.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <ProductGallery images={product.images} title={product.title} />

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{product.title}</h1>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-500">
                {avgRating.toFixed(1)} ({SAMPLE_REVIEWS.length} reviews)
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-slate-900">
              ${variant.price.toFixed(2)}
            </span>
            {variant.compareAtPrice && (
              <span className="text-lg text-slate-400 line-through">
                ${variant.compareAtPrice.toFixed(2)}
              </span>
            )}
            {variant.compareAtPrice && (
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                Save ${(variant.compareAtPrice - variant.price).toFixed(2)}
              </span>
            )}
          </div>

          <VariantSelector
            options={product.options}
            selectedOptions={selectedOptions}
            onChange={handleOptionChange}
          />

          {/* Quantity */}
          <div>
            <p className="mb-2 text-sm font-medium text-slate-900">Quantity</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-sm font-medium text-slate-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            {addedToCart ? 'Added to cart!' : 'Add to Cart'}
          </button>

          {/* Description */}
          <div className="border-t border-slate-100 pt-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">Description</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16 border-t border-slate-200 pt-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">
          Customer Reviews ({SAMPLE_REVIEWS.length})
        </h2>
        <div className="space-y-6">
          {SAMPLE_REVIEWS.map((review) => (
            <div key={review.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-900">{review.author}</p>
                  <div className="mt-1 flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-slate-400">{review.date}</span>
              </div>
              <p className="mt-3 text-sm text-slate-600">{review.comment}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
