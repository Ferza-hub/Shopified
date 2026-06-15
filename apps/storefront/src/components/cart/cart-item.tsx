'use client';

import { Minus, Plus, X } from 'lucide-react';
import { useCartStore, type CartItem as CartItemType } from '@/lib/cart-store';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        {item.image ? (
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-100" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
            {item.variantTitle && item.variantTitle !== 'Default Title' && (
              <p className="text-xs text-gray-500 mt-0.5">{item.variantTitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.key)}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-2 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button
              type="button"
              onClick={() => updateQty(item.key, item.quantity - 1)}
              className="p-1.5 text-gray-500 hover:text-black transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 text-sm font-medium text-gray-900 min-w-[2rem] text-center">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQty(item.key, item.quantity + 1)}
              className="p-1.5 text-gray-500 hover:text-black transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            ${(item.price * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
