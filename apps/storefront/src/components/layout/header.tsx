'use client';

import Link from 'next/link';
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/lib/cart-store';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const itemCount = useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
            SHOPIFIED
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
              Home
            </Link>
            <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
              Products
            </Link>
            <Link href="/collections" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
              Collections
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:text-black transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <Link href="/account" className="p-2 text-gray-500 hover:text-black transition-colors">
              <User className="w-5 h-5" />
            </Link>
            <Link href="/cart" className="relative p-2 text-gray-500 hover:text-black transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
            <button
              className="md:hidden p-2 text-gray-500 hover:text-black"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <Link href="/" className="block text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/products" className="block text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Products</Link>
          <Link href="/collections" className="block text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>Collections</Link>
        </div>
      )}
    </header>
  );
}
