import Link from 'next/link';
import ProductCard from '@/components/product/product-card';

const SAMPLE_PRODUCTS = [
  { id: '1', handle: 'classic-tee', title: 'Classic Cotton Tee', price: 29.99, compareAtPrice: 39.99, badge: 'Sale' },
  { id: '2', handle: 'slim-chinos', title: 'Slim Fit Chinos', price: 59.99, badge: 'New' },
  { id: '3', handle: 'canvas-sneakers', title: 'Canvas Sneakers', price: 79.99, compareAtPrice: 99.99 },
  { id: '4', handle: 'leather-wallet', title: 'Leather Wallet', price: 49.99, badge: 'Bestseller' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
          <div className="flex flex-col items-center text-center">
            <span className="mb-4 inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
              New Collection Available
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Style That Speaks{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                For Itself
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-400">
              Discover our curated collection of premium essentials. Crafted for comfort,
              designed for life.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/products"
                className="inline-flex h-12 items-center justify-center rounded-full bg-indigo-600 px-8 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 transition-colors"
              >
                Shop Now
              </Link>
              <Link
                href="/collections/all"
                className="inline-flex h-12 items-center justify-center rounded-full border border-slate-600 px-8 text-sm font-semibold text-slate-300 hover:border-slate-400 hover:text-white transition-colors"
              >
                Browse Collections
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Products</h2>
            <p className="mt-1 text-sm text-slate-500">Handpicked for you this season</p>
          </div>
          <Link
            href="/products"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SAMPLE_PRODUCTS.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* Value Props */}
      <section className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { title: 'Free Shipping', desc: 'On all orders over $50' },
              { title: '30-Day Returns', desc: 'No questions asked' },
              { title: 'Secure Checkout', desc: 'Your data is always safe' },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
