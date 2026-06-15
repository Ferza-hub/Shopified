import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSeoDto } from './dto/update-seo.dto';

@Injectable()
export class SeoService {
  constructor(private readonly prisma: PrismaService) {}

  async updateProductSeo(storeId: string, id: string, dto: UpdateSeoDto) {
    const product = await this.prisma.product.findFirst({ where: { id, storeId } });
    if (!product) throw new NotFoundException('Product not found');
    return this.prisma.product.update({
      where: { id },
      data: { seoTitle: dto.seoTitle, seoDescription: dto.seoDescription },
    });
  }

  async updateCollectionSeo(storeId: string, id: string, dto: UpdateSeoDto) {
    const collection = await this.prisma.collection.findFirst({ where: { id, storeId } });
    if (!collection) throw new NotFoundException('Collection not found');
    return this.prisma.collection.update({
      where: { id },
      data: { seoTitle: dto.seoTitle, seoDescription: dto.seoDescription },
    });
  }

  async updatePageSeo(storeId: string, id: string, dto: UpdateSeoDto) {
    const page = await this.prisma.page.findFirst({ where: { id, storeId } });
    if (!page) throw new NotFoundException('Page not found');
    return this.prisma.page.update({
      where: { id },
      data: { seoTitle: dto.seoTitle, seoDescription: dto.seoDescription },
    });
  }

  async updateBlogPostSeo(storeId: string, id: string, dto: UpdateSeoDto) {
    const post = await this.prisma.blogPost.findFirst({
      where: { id, blog: { storeId } },
    });
    if (!post) throw new NotFoundException('Blog post not found');
    return this.prisma.blogPost.update({
      where: { id },
      data: { seoTitle: dto.seoTitle, seoDescription: dto.seoDescription },
    });
  }

  async getStoreSeo(storeId: string) {
    const settings = await this.prisma.storeSettings.findUnique({
      where: { storeId },
      select: { seoTitle: true, seoDescription: true },
    });
    if (!settings) throw new NotFoundException('Store settings not found');
    return settings;
  }

  async updateStoreSeo(storeId: string, dto: UpdateSeoDto) {
    return this.prisma.storeSettings.upsert({
      where: { storeId },
      create: { storeId, seoTitle: dto.seoTitle, seoDescription: dto.seoDescription },
      update: { seoTitle: dto.seoTitle, seoDescription: dto.seoDescription },
    });
  }
}
