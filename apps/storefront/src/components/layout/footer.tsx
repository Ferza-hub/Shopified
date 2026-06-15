import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="text-white text-xl font-bold mb-3">SHOPIFIED</div>
            <p className="text-sm text-gray-400 max-w-xs">
              Your one-stop online store. Quality products, fast delivery, great prices.
            </p>
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/collections" className="hover:text-white transition-colors">Collections</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Help</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/pages/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/pages/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/pages/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/account" className="hover:text-white transition-colors">My Account</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-800 pt-6 text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} Shopified. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
