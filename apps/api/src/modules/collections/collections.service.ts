import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { uniqueSlug } from '@shopified/shared';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(storeId: string) {
    return this.prisma.collection.findMany({
      where: { storeId },
      include: { _count: { select: { products: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(storeId: string, dto: CreateCollectionDto) {
    const handle = await this.generateHandle(storeId, dto.title);
    return this.prisma.collection.create({
      data: { storeId, handle, ...dto },
    });
  }

  async findOne(storeId: string, id: string) {
    const collection = await this.prisma.collection.findFirst({
      where: { id, storeId },
      include: {
        products: {
          include: {
            product: { include: { images: { take: 1 } } },
          },
          orderBy: { position: 'asc' },
        },
      },
    });
    if (!collection) throw new NotFoundException('Collection not found');
    return collection;
  }

  async update(storeId: string, id: string, dto: UpdateCollectionDto) {
    await this.findOne(storeId, id);
    return this.prisma.collection.update({ where: { id }, data: dto });
  }

  async remove(storeId: string, id: string) {
    await this.findOne(storeId, id);
    return this.prisma.collection.delete({ where: { id } });
  }

  async addProduct(
    storeId: string,
    collectionId: string,
    productId: string,
    position: number = 0,
  ) {
    await this.findOne(storeId, collectionId);
    const product = await this.prisma.product.findFirst({
      where: { id: productId, storeId },
    });
    if (!product) throw new NotFoundException('Product not found');
    return this.prisma.collectionProduct.upsert({
      where: { collectionId_productId: { collectionId, productId } },
      create: { collectionId, productId, position },
      update: { position },
    });
  }

  async removeProduct(
    storeId: string,
    collectionId: string,
    productId: string,
  ) {
    await this.findOne(storeId, collectionId);
    return this.prisma.collectionProduct.deleteMany({
      where: { collectionId, productId },
    });
  }

  private async generateHandle(storeId: string, title: string): Promise<string> {
    const existing = await this.prisma.collection.findMany({
      where: { storeId },
      select: { handle: true },
    });
    return uniqueSlug(title, existing.map((c) => c.handle));
  }
}
