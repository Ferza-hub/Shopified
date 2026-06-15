'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, ProductVariant } from '@/lib/types';

export interface CartItem {
  /** Unique key per line = variant id (falls back to product id). */
  key: string;
  productId: string;
  variantId: string;
  handle: string;
  title: string;
  variantTitle: string;
  price: number;
  image?: string | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  addItem: (
    product: Pick<Product, 'id' | 'title' | 'handle'> & { image?: string | null },
    variant: Pick<ProductVariant, 'id' | 'title' | 'price'>,
    quantity?: number,
  ) => void;
  updateQty: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;

  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (product, variant, quantity = 1) =>
        set((state) => {
          const key = variant.id || product.id;
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            return {
              isOpen: true,
              items: state.items.map((i) =>
                i.key === key ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            };
          }
          const item: CartItem = {
            key,
            productId: product.id,
            variantId: variant.id,
            handle: product.handle,
            title: product.title,
            variantTitle: variant.title,
            price: variant.price,
            image: product.image ?? null,
            quantity,
          };
          return { isOpen: true, items: [...state.items, item] };
        }),

      updateQty: (key, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.key !== key)
              : state.items.map((i) => (i.key === key ? { ...i, quantity } : i)),
        })),

      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((i) => i.key !== key) })),

      clear: () => set({ items: [] }),

      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),
      toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'shopified-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

/** Derived selectors (call with the hook to stay reactive). */
export const selectCount = (state: CartState): number =>
  state.items.reduce((acc, i) => acc + i.quantity, 0);

export const selectSubtotal = (state: CartState): number =>
  state.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
