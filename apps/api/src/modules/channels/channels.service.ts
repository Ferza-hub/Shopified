import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { CreateListingDto } from './dto/create-listing.dto';

@Injectable()
export class ChannelsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(storeId: string) {
    return this.prisma.channel.findMany({
      where: { storeId },
      include: { _count: { select: { listings: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(storeId: string, dto: CreateChannelDto) {
    return this.prisma.channel.create({
      data: {
        storeId,
        name: dto.name,
        platform: dto.platform as any,
        credentials: dto.credentials ?? {},
        settings: dto.settings ?? {},
      },
    });
  }

  async findOne(storeId: string, id: string) {
    const channel = await this.prisma.channel.findFirst({
      where: { id, storeId },
      include: { _count: { select: { listings: true } } },
    });
    if (!channel) throw new NotFoundException('Channel not found');
    return channel;
  }

  async update(storeId: string, id: string, dto: Partial<CreateChannelDto>) {
    await this.findOne(storeId, id);
    return this.prisma.channel.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.settings !== undefined && { settings: dto.settings }),
        ...(dto.credentials !== undefined && { credentials: dto.credentials }),
      },
    });
  }

  async remove(storeId: string, id: string) {
    await this.findOne(storeId, id);
    return this.prisma.channel.delete({ where: { id } });
  }

  async findListings(storeId: string, id: string) {
    await this.findOne(storeId, id);
    return this.prisma.channelListing.findMany({
      where: { channelId: id },
      include: { product: { select: { id: true, title: true, handle: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async sync(storeId: string, id: string) {
    await this.findOne(storeId, id);
    await this.prisma.channel.update({ where: { id }, data: { lastSyncAt: new Date() } });
    return { status: 'queued' };
  }

  async createListing(storeId: string, channelId: string, dto: CreateListingDto) {
    await this.findOne(storeId, channelId);
    return this.prisma.channelListing.upsert({
      where: { channelId_productId: { channelId, productId: dto.productId } },
      create: {
        channelId,
        productId: dto.productId,
        price: dto.price,
        isActive: dto.isActive ?? true,
      },
      update: {
        price: dto.price,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateListing(storeId: string, channelId: string, listingId: string, dto: Partial<CreateListingDto>) {
    await this.findOne(storeId, channelId);
    const listing = await this.prisma.channelListing.findFirst({ where: { id: listingId, channelId } });
    if (!listing) throw new NotFoundException('Listing not found');
    return this.prisma.channelListing.update({
      where: { id: listingId },
      data: {
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }
}
