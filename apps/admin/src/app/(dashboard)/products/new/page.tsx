import { ProductForm } from '@/components/products/product-form';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Add product</h1>
        <p className="mt-1 text-sm text-slate-500">Create a new product in your store</p>
      </div>
      <ProductForm />
    </div>
  );
}
