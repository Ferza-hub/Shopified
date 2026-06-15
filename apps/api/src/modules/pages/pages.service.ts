import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateUniqueHandle(storeId: string, base: string, excludeId?: string): Promise<string> {
    let handle = slugify(base);
    let suffix = 0;
    while (true) {
      const candidate = suffix === 0 ? handle : `${handle}-${suffix}`;
      const existing = await this.prisma.page.findFirst({
        where: { storeId, handle: candidate, ...(excludeId && { NOT: { id: excludeId } }) },
      });
      if (!existing) return candidate;
      suffix++;
    }
  }

  async findAll(storeId: string) {
    return this.prisma.page.findMany({ where: { storeId }, orderBy: { createdAt: 'desc' } });
  }

  async create(storeId: string, dto: CreatePageDto) {
    const handle = await this.generateUniqueHandle(storeId, dto.handle || dto.title);
    return this.prisma.page.create({
      data: {
        storeId,
        title: dto.title,
        handle,
        body: dto.body,
        bodyHtml: dto.bodyHtml,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
      },
    });
  }

  async findOne(storeId: string, id: string) {
    const page = await this.prisma.page.findFirst({ where: { id, storeId } });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async update(storeId: string, id: string, dto: UpdatePageDto) {
    await this.findOne(storeId, id);
    const handle = dto.handle || dto.title
      ? await this.generateUniqueHandle(storeId, dto.handle || dto.title!, id)
      : undefined;
    return this.prisma.page.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(handle && { handle }),
        ...(dto.body !== undefined && { body: dto.body }),
        ...(dto.bodyHtml !== undefined && { bodyHtml: dto.bodyHtml }),
        ...(dto.publishedAt !== undefined && { publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null }),
        ...(dto.seoTitle !== undefined && { seoTitle: dto.seoTitle }),
        ...(dto.seoDescription !== undefined && { seoDescription: dto.seoDescription }),
      },
    });
  }

  async remove(storeId: string, id: string) {
    await this.findOne(storeId, id);
    return this.prisma.page.delete({ where: { id } });
  }

  async findByHandle(storeId: string, handle: string) {
    const page = await this.prisma.page.findFirst({
      where: { storeId, handle, NOT: { publishedAt: null } },
    });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }
}
