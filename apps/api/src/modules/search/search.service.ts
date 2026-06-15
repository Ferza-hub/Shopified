import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(storeId: string, q: string, types: string[]) {
    const searchTypes = types.length > 0 ? types : ['products', 'collections', 'pages'];

    const [products, collections, pages] = await Promise.all([
      searchTypes.includes('products')
        ? this.prisma.product.findMany({
            where: {
              storeId,
              status: 'ACTIVE',
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { tags: { has: q } },
              ],
            },
            include: {
              images: { orderBy: { position: 'asc' }, take: 1 },
              variants: { orderBy: { position: 'asc' }, take: 1, select: { price: true } },
            },
            take: 20,
          })
        : Promise.resolve([]),

      searchTypes.includes('collections')
        ? this.prisma.collection.findMany({
            where: {
              storeId,
              title: { contains: q, mode: 'insensitive' },
            },
            include: { _count: { select: { products: true } } },
            take: 10,
          })
        : Promise.resolve([]),

      searchTypes.includes('pages')
        ? this.prisma.page.findMany({
            where: {
              storeId,
              NOT: { publishedAt: null },
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { body: { contains: q, mode: 'insensitive' } },
              ],
            },
            take: 10,
          })
        : Promise.resolve([]),
    ]);

    return {
      products: products.map((p) => ({
        ...p,
        variants: p.variants.map((v) => ({ ...v, price: Number(v.price) })),
      })),
      collections,
      pages,
    };
  }
}
