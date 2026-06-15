import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(storeId: string, query: ReviewQueryDto) {
    return this.prisma.review.findMany({
      where: {
        storeId,
        ...(query.productId && { productId: query.productId }),
        ...(query.rating && { rating: query.rating }),
        ...(query.status && { status: query.status as any }),
      },
      orderBy: { createdAt: 'desc' },
      include: { images: true },
    });
  }

  async findOne(storeId: string, id: string) {
    const review = await this.prisma.review.findFirst({ where: { id, storeId }, include: { images: true } });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async approve(storeId: string, id: string) {
    await this.findOne(storeId, id);
    return this.prisma.review.update({ where: { id }, data: { status: 'APPROVED' } });
  }

  async reject(storeId: string, id: string) {
    await this.findOne(storeId, id);
    return this.prisma.review.update({ where: { id }, data: { status: 'REJECTED' } });
  }

  async remove(storeId: string, id: string) {
    await this.findOne(storeId, id);
    return this.prisma.review.delete({ where: { id } });
  }

  async submitPublic(dto: CreateReviewDto) {
    return this.prisma.review.create({
      data: {
        productId: dto.productId,
        authorName: dto.authorName,
        authorEmail: dto.authorEmail,
        rating: dto.rating,
        title: dto.title,
        body: dto.body,
        status: 'PENDING',
      },
    });
  }

  async getPublicProductReviews(productId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { productId, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      include: { images: true },
    });
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    return { reviews, averageRating: Math.round(averageRating * 10) / 10, total: reviews.length };
  }
}
