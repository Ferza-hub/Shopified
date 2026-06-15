import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { SetInventoryDto } from './dto/set-inventory.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    storeId: string,
    query: { locationId?: string; variantId?: string },
  ) {
    const where: Prisma.InventoryLevelWhereInput = {
      location: { storeId },
      ...(query.locationId && { locationId: query.locationId }),
      ...(query.variantId && {
        inventoryItem: { variantId: query.variantId },
      }),
    };

    return this.prisma.inventoryLevel.findMany({
      where,
      include: {
        inventoryItem: {
          include: {
            variant: {
              include: {
                product: {
                  select: { id: true, title: true, storeId: true },
                },
              },
            },
          },
        },
        location: true,
      },
    });
  }

  async adjust(storeId: string, dto: AdjustInventoryDto) {
    const location = await this.prisma.location.findFirst({
      where: { id: dto.locationId, storeId },
    });
    if (!location) throw new NotFoundException('Location not found');

    return this.prisma.inventoryLevel.upsert({
      where: {
        inventoryItemId_locationId: {
          inventoryItemId: dto.inventoryItemId,
          locationId: dto.locationId,
        },
      },
      create: {
        inventoryItemId: dto.inventoryItemId,
        locationId: dto.locationId,
        available: Math.max(0, dto.adjustment),
        onHand: Math.max(0, dto.adjustment),
        committed: 0,
        incoming: 0,
      },
      update: {
        available: { increment: dto.adjustment },
        onHand: { increment: dto.adjustment },
      },
    });
  }

  async set(storeId: string, dto: SetInventoryDto) {
    const location = await this.prisma.location.findFirst({
      where: { id: dto.locationId, storeId },
    });
    if (!location) throw new NotFoundException('Location not found');

    return this.prisma.inventoryLevel.upsert({
      where: {
        inventoryItemId_locationId: {
          inventoryItemId: dto.inventoryItemId,
          locationId: dto.locationId,
        },
      },
      create: {
        inventoryItemId: dto.inventoryItemId,
        locationId: dto.locationId,
        available: dto.quantity,
        onHand: dto.quantity,
        committed: 0,
        incoming: 0,
      },
      update: {
        available: dto.quantity,
        onHand: dto.quantity,
      },
    });
  }

  async getLocations(storeId: string) {
    return this.prisma.location.findMany({
      where: { storeId },
      include: {
        _count: { select: { inventoryLevels: true } },
      },
    });
  }

  async createLocation(storeId: string, dto: CreateLocationDto) {
    return this.prisma.location.create({
      data: { storeId, ...dto },
    });
  }

  async updateLocation(
    storeId: string,
    id: string,
    dto: UpdateLocationDto,
  ) {
    const location = await this.prisma.location.findFirst({
      where: { id, storeId },
    });
    if (!location) throw new NotFoundException('Location not found');

    return this.prisma.location.update({
      where: { id },
      data: dto,
    });
  }

  async deactivateLocation(storeId: string, id: string) {
    const location = await this.prisma.location.findFirst({
      where: { id, storeId },
    });
    if (!location) throw new NotFoundException('Location not found');

    return this.prisma.location.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
