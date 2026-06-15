import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { uniqueSlug } from '@shopified/shared';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(storeId: string, query: ProductQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      storeId,
      ...(query.status && { status: query.status }),
      ...(query.search && {
        title: { contains: query.search, mode: 'insensitive' as Prisma.QueryMode },
      }),
      ...(query.collectionId && {
        collections: { some: { collectionId: query.collectionId } },
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: { take: 1, orderBy: { position: 'asc' } },
          _count: { select: { variants: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data, page, limit, total };
  }

  async create(storeId: string, dto: CreateProductDto) {
    const handle = await this.generateHandle(storeId, dto.title);
    return this.prisma.product.create({
      data: {
        storeId,
        title: dto.title,
        handle,
        description: dto.description,
        descriptionHtml: dto.descriptionHtml,
        productType: dto.productType,
        vendor: dto.vendor,
        tags: dto.tags || [],
        status: dto.status || 'DRAFT',
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        requiresShipping: dto.requiresShipping ?? true,
        trackInventory: dto.trackInventory ?? true,
        variants: {
          create: [
            {
              title: 'Default Title',
              price: '0.00',
              position: 0,
              inventoryItem: {
                create: {
                  tracked: true,
                  requiresShipping: dto.requiresShipping ?? true,
                },
              },
            },
          ],
        },
      },
      include: {
        variants: true,
        images: true,
        options: { include: { values: true } },
      },
    });
  }

  async findOne(storeId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, storeId },
      include: {
        variants: {
          include: { inventoryItem: true },
          orderBy: { position: 'asc' },
        },
        images: { orderBy: { position: 'asc' } },
        options: {
          include: { values: { orderBy: { position: 'asc' } } },
          orderBy: { position: 'asc' },
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(storeId: string, id: string, dto: UpdateProductDto) {
    await this.findOne(storeId, id);
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { variants: true, images: true },
    });
  }

  async remove(storeId: string, id: string) {
    await this.findOne(storeId, id);
    return this.prisma.product.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }

  async publish(storeId: string, id: string) {
    await this.findOne(storeId, id);
    return this.prisma.product.update({
      where: { id },
      data: { status: 'ACTIVE', publishedAt: new Date() },
    });
  }

  async archive(storeId: string, id: string) {
    await this.findOne(storeId, id);
    return this.prisma.product.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }

  async getVariants(storeId: string, productId: string) {
    await this.findOne(storeId, productId);
    return this.prisma.productVariant.findMany({
      where: { productId },
      include: { inventoryItem: true },
      orderBy: { position: 'asc' },
    });
  }

  async createVariant(
    storeId: string,
    productId: string,
    dto: CreateVariantDto,
  ) {
    await this.findOne(storeId, productId);
    return this.prisma.productVariant.create({
      data: {
        productId,
        title: dto.title,
        sku: dto.sku,
        barcode: dto.barcode,
        price: dto.price,
        compareAtPrice: dto.compareAtPrice,
        costPerItem: dto.costPerItem,
        weight: dto.weight,
        weightUnit: dto.weightUnit || 'kg',
        requiresShipping: dto.requiresShipping ?? true,
        taxable: dto.taxable ?? true,
        position: dto.position || 0,
        selectedOptions: dto.selectedOptions || [],
        inventoryItem: {
          create: {
            tracked: true,
            requiresShipping: dto.requiresShipping ?? true,
          },
        },
      },
      include: { inventoryItem: true },
    });
  }

  async updateVariant(
    storeId: string,
    productId: string,
    variantId: string,
    dto: UpdateVariantDto,
  ) {
    await this.findOne(storeId, productId);
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    });
    if (!variant) throw new NotFoundException('Variant not found');
    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: dto,
    });
  }

  async removeVariant(
    storeId: string,
    productId: string,
    variantId: string,
  ) {
    await this.findOne(storeId, productId);
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    });
    if (!variant) throw new NotFoundException('Variant not found');
    return this.prisma.productVariant.delete({ where: { id: variantId } });
  }

  async addImage(
    storeId: string,
    productId: string,
    body: { url: string; altText?: string; position?: number },
  ) {
    await this.findOne(storeId, productId);
    return this.prisma.productImage.create({
      data: {
        productId,
        url: body.url,
        altText: body.altText,
        position: body.position || 0,
      },
    });
  }

  async removeImage(
    storeId: string,
    productId: string,
    imageId: string,
  ) {
    await this.findOne(storeId, productId);
    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });
    if (!image) throw new NotFoundException('Image not found');
    return this.prisma.productImage.delete({ where: { id: imageId } });
  }

  async bulkUpdateStatus(
    storeId: string,
    productIds: string[],
    status: ProductStatus,
  ) {
    return this.prisma.product.updateMany({
      where: { id: { in: productIds }, storeId },
      data: { status },
    });
  }

  private async generateHandle(storeId: string, title: string): Promise<string> {
    const existing = await this.prisma.product.findMany({
      where: { storeId },
      select: { handle: true },
    });
    return uniqueSlug(title, existing.map((p) => p.handle));
  }
}
