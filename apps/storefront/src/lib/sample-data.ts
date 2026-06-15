import type { Collection, OrderSummary, Product } from '@/lib/types';

/**
 * Sample catalog used as a graceful fallback whenever the backend API is
 * unavailable. Keeps the storefront fully browsable for demos and local dev.
 */

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

function makeProduct(
  partial: Pick<Product, 'id' | 'title' | 'handle' | 'productType'> & {
    price: number;
    image: string;
    image2?: string;
    description?: string;
    compareAtPrice?: number | null;
  },
): Product {
  const images = [
    { id: `${partial.id}-img1`, url: partial.image, altText: partial.title, position: 0 },
  ];
  if (partial.image2) {
    images.push({
      id: `${partial.id}-img2`,
      url: partial.image2,
      altText: partial.title,
      position: 1,
    });
  }
  return {
    id: partial.id,
    title: partial.title,
    handle: partial.handle,
    description:
      partial.description ??
      'Thoughtfully designed and built to last. A quiet essential for everyday living.',
    productType: partial.productType,
    vendor: 'Shopified',
    tags: [partial.productType ?? 'general'],
    images,
    options: [
      { id: `${partial.id}-opt`, name: 'Size', position: 0, values: ['S', 'M', 'L', 'XL'] },
    ],
    variants: ['S', 'M', 'L', 'XL'].map((size, idx) => ({
      id: `${partial.id}-v${idx}`,
      title: size,
      sku: `${partial.handle}-${size}`,
      price: partial.price,
      compareAtPrice: partial.compareAtPrice ?? null,
      available: true,
      selectedOptions: [{ name: 'Size', value: size }],
    })),
    price: partial.price,
    compareAtPrice: partial.compareAtPrice ?? null,
  };
}

export const sampleProducts: Product[] = [
  makeProduct({
    id: 'p1',
    title: 'Heavyweight Cotton Tee',
    handle: 'heavyweight-cotton-tee',
    productType: 'Apparel',
    price: 38,
    compareAtPrice: 48,
    image: img('1521572163474-6864f9cf17ab'),
    image2: img('1503341504253-dff4815485f1'),
  }),
  makeProduct({
    id: 'p2',
    title: 'Relaxed Linen Shirt',
    handle: 'relaxed-linen-shirt',
    productType: 'Apparel',
    price: 88,
    image: img('1596755094514-f87e34085b2c'),
    image2: img('1542060748-10c28b62716f'),
  }),
  makeProduct({
    id: 'p3',
    title: 'Everyday Canvas Tote',
    handle: 'everyday-canvas-tote',
    productType: 'Accessories',
    price: 54,
    image: img('1544816155-12df9643f363'),
    image2: img('1553062407-98eeb64c6a62'),
  }),
  makeProduct({
    id: 'p4',
    title: 'Minimal Leather Wallet',
    handle: 'minimal-leather-wallet',
    productType: 'Accessories',
    price: 72,
    compareAtPrice: 90,
    image: img('1627123424574-724758594e93'),
  }),
  makeProduct({
    id: 'p5',
    title: 'Wool Blend Beanie',
    handle: 'wool-blend-beanie',
    productType: 'Accessories',
    price: 32,
    image: img('1576871337632-b9aef4c17ab9'),
  }),
  makeProduct({
    id: 'p6',
    title: 'Ceramic Pour-Over Set',
    handle: 'ceramic-pour-over-set',
    productType: 'Home',
    price: 64,
    image: img('1495474472287-4d71bcdd2085'),
    image2: img('1442512595331-e89e73853f31'),
  }),
  makeProduct({
    id: 'p7',
    title: 'Stoneware Mug',
    handle: 'stoneware-mug',
    productType: 'Home',
    price: 24,
    image: img('1514228742587-6b1558fcca3d'),
  }),
  makeProduct({
    id: 'p8',
    title: 'Organic Cotton Hoodie',
    handle: 'organic-cotton-hoodie',
    productType: 'Apparel',
    price: 96,
    compareAtPrice: 120,
    image: img('1556821840-3a63f95609a7'),
    image2: img('1620799140408-edc6dcb6d633'),
  }),
];

export const sampleCollections: Collection[] = [
  {
    id: 'c1',
    title: 'Apparel',
    handle: 'apparel',
    description: 'Elevated basics for an effortless wardrobe.',
    image: img('1490481651871-ab68de25d43d'),
    products: sampleProducts.filter((p) => p.productType === 'Apparel'),
  },
  {
    id: 'c2',
    title: 'Accessories',
    handle: 'accessories',
    description: 'The finishing details that complete every look.',
    image: img('1553062407-98eeb64c6a62'),
    products: sampleProducts.filter((p) => p.productType === 'Accessories'),
  },
  {
    id: 'c3',
    title: 'Home',
    handle: 'home',
    description: 'Quiet objects for considered living.',
    image: img('1495474472287-4d71bcdd2085'),
    products: sampleProducts.filter((p) => p.productType === 'Home'),
  },
];

export const sampleOrders: OrderSummary[] = [
  {
    id: 'o1',
    number: '#1042',
    createdAt: '2026-05-28T10:24:00.000Z',
    status: 'Fulfilled',
    total: 126,
    currency: 'USD',
    itemCount: 3,
  },
  {
    id: 'o2',
    number: '#1031',
    createdAt: '2026-04-12T16:02:00.000Z',
    status: 'Delivered',
    total: 72,
    currency: 'USD',
    itemCount: 1,
  },
];

export function sampleProductByHandle(handle: string): Product | undefined {
  return sampleProducts.find((p) => p.handle === handle);
}

export function sampleCollectionByHandle(handle: string): Collection | undefined {
  return sampleCollections.find((c) => c.handle === handle);
}
