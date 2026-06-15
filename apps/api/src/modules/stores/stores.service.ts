import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { uniqueSlug } from '@shopified/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  async createStore(userId: string, dto: CreateStoreDto) {
    const existing = await this.prisma.store.findMany({
      select: { slug: true },
    });
    const slug = uniqueSlug(dto.name, existing.map((s) => s.slug));

    return this.prisma.$transaction(async (tx) => {
      const store = await tx.store.create({
        data: {
          name: dto.name,
          slug,
          email: dto.email,
          phone: dto.phone,
          description: dto.description,
          currency: dto.currency,
          timezone: dto.timezone,
          locale: dto.locale,
          settings: { create: {} },
          users: {
            create: {
              userId,
              role: 'OWNER',
            },
          },
        },
        include: {
          settings: true,
          users: {
            where: { userId },
            select: { role: true },
          },
        },
      });
      return store;
    });
  }

  async findByUser(userId: string) {
    const memberships = await this.prisma.storeUser.findMany({
      where: { userId },
      include: {
        store: {
          include: {
            settings: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return memberships.map((m) => ({
      ...m.store,
      role: m.role,
    }));
  }

  async findOne(storeId: string, userId: string) {
    const membership = await this.prisma.storeUser.findUnique({
      where: { storeId_userId: { storeId, userId } },
      include: {
        store: {
          include: {
            settings: true,
          },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Store not found or you are not a member');
    }

    return {
      ...membership.store,
      role: membership.role,
    };
  }

  async update(storeId: string, userId: string, dto: UpdateStoreDto) {
    const membership = await this.prisma.storeUser.findUnique({
      where: { storeId_userId: { storeId, userId } },
    });

    if (!membership) {
      throw new NotFoundException('Store not found or you are not a member');
    }

    return this.prisma.store.update({
      where: { id: storeId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
        ...(dto.timezone !== undefined && { timezone: dto.timezone }),
        ...(dto.locale !== undefined && { locale: dto.locale }),
        ...(dto.logo !== undefined && { logo: dto.logo }),
        ...(dto.favicon !== undefined && { favicon: dto.favicon }),
        ...(dto.domain !== undefined && { domain: dto.domain }),
      },
      include: { settings: true },
    });
  }

  async remove(storeId: string, userId: string) {
    const membership = await this.prisma.storeUser.findUnique({
      where: { storeId_userId: { storeId, userId } },
    });

    if (!membership) {
      throw new NotFoundException('Store not found or you are not a member');
    }

    if (membership.role !== 'OWNER') {
      throw new ForbiddenException('Only the store owner can delete the store');
    }

    await this.prisma.store.delete({ where: { id: storeId } });
  }

  async getSettings(storeId: string) {
    const settings = await this.prisma.storeSettings.findUnique({
      where: { storeId },
    });

    if (!settings) {
      throw new NotFoundException('Store settings not found');
    }

    return settings;
  }

  async updateSettings(storeId: string, dto: UpdateSettingsDto) {
    return this.prisma.storeSettings.upsert({
      where: { storeId },
      create: {
        storeId,
        ...dto,
      },
      update: {
        ...dto,
      },
    });
  }
}
