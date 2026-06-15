import { apiGet } from '@/lib/api';
import { lowestVariantPrice } from '@/lib/utils';
import type { Collection, Product } from '@/lib/types';
import {
  sampleCollectionByHandle,
  sampleCollections,
  sampleProductByHandle,
  sampleProducts,
} from '@/lib/sample-data';

/** Some APIs return `{ data, meta }`; normalize to a plain array. */
function asArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as any).data)) {
    return (payload as any).data as T[];
  }
  return [];
}

/** Ensure a `price` convenience field is present on a product. */
function withPrice(product: Product): Product {
  if (typeof product.price === 'number') return product;
  return {
    ...product,
    price: lowestVariantPrice((product.variants ?? []).map((v) => v.price)),
  };
}

export async function getProducts(params?: Record<string, unknown>): Promise<Product[]> {
  try {
    const payload = await apiGet<unknown>('/products', params);
    const list = asArray<Product>(payload);
    if (list.length === 0) return sampleProducts;
    return list.map(withPrice);
  } catch {
    return sampleProducts;
  }
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
  try {
    const payload = await apiGet<Product>(`/products/${handle}`);
    if (payload && (payload as any).id) return withPrice(payload);
    return sampleProductByHandle(handle) ?? null;
  } catch {
    return sampleProductByHandle(handle) ?? null;
  }
}

export async function getCollections(): Promise<Collection[]> {
  try {
    const payload = await apiGet<unknown>('/collections');
    const list = asArray<Collection>(payload);
    if (list.length === 0) return sampleCollections;
    return list;
  } catch {
    return sampleCollections;
  }
}

export async function getCollectionByHandle(handle: string): Promise<Collection | null> {
  try {
    const payload = await apiGet<Collection>(`/collections/${handle}`);
    if (payload && (payload as any).id) {
      return { ...payload, products: (payload.products ?? []).map(withPrice) };
    }
    return sampleCollectionByHandle(handle) ?? null;
  } catch {
    return sampleCollectionByHandle(handle) ?? null;
  }
}
