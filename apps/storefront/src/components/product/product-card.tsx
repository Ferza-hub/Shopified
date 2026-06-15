'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';

interface ProductCardProps {
  id: string;
  handle: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  badge?: string;
  variantId?: string;
}

export default function ProductCard({ id, handle, title, price, compareAtPrice, image, badge, variantId }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(
      { id, title, handle, image: image ?? null },
      { id: variantId ?? `${id}-default`, title: 'Default', price },
      1,
    );
  };

  const discount = compareAtPrice ? Math.round((1 - price / compareAtPrice) * 100) : null;

  return (
    <Link href={`/products/${handle}`} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square mb-3">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {badge && (
          <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">{badge}</span>
        )}
        {discount && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">-{discount}%</span>
        )}
        <button
          type="button"
          onClick={handleAddToCart}
          className="absolute bottom-0 left-0 right-0 bg-black text-white text-sm py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200 flex items-center justify-center gap-2 font-medium"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-900 truncate">{title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold text-gray-900">${price.toFixed(2)}</span>
          {compareAtPrice && (
            <span className="text-sm text-gray-400 line-through">${compareAtPrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
