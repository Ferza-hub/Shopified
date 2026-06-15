import type { SelectedOption } from '@shopified/shared';

export interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
  position?: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku?: string | null;
  price: number;
  compareAtPrice?: number | null;
  available?: boolean;
  imageId?: string | null;
  selectedOptions: SelectedOption[];
}

export interface ProductOption {
  id: string;
  name: string;
  position?: number;
  values: string[];
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  descriptionHtml?: string | null;
  productType?: string | null;
  vendor?: string | null;
  tags?: string[];
  images: ProductImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  /** Convenience: lowest variant price. */
  price?: number;
  compareAtPrice?: number | null;
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  image?: string | null;
  products: Product[];
}

export interface OrderSummary {
  id: string;
  number: string;
  createdAt: string;
  status: string;
  total: number;
  currency: string;
  itemCount: number;
}
