import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class ThemesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(storeId: string) {
    return this.prisma.theme.findMany({ where: { storeId }, orderBy: { createdAt: 'desc' } });
  }

  async create(storeId: string, dto: CreateThemeDto) {
    return this.prisma.theme.create({
      data: {
        storeId,
        name: dto.name,
        role: (dto.role as any) ?? 'UNPUBLISHED',
      },
    });
  }

  async findOne(storeId: string, id: string) {
    const theme = await this.prisma.theme.findFirst({ where: { id, storeId } });
    if (!theme) throw new NotFoundException('Theme not found');
    return theme;
  }

  async updateSettings(storeId: string, id: string, dto: UpdateSettingsDto) {
    const theme = await this.findOne(storeId, id);
    const merged = { ...(theme.settings as Record<string, any>), ...dto.settings };
    return this.prisma.theme.update({
      where: { id },
      data: { settings: merged },
    });
  }

  async publish(storeId: string, id: string) {
    await this.findOne(storeId, id);
    return this.prisma.$transaction(async (tx) => {
      await tx.theme.updateMany({
        where: { storeId, role: 'MAIN' },
        data: { role: 'UNPUBLISHED' },
      });
      return tx.theme.update({
        where: { id },
        data: { role: 'MAIN' },
      });
    });
  }

  async remove(storeId: string, id: string) {
    const theme = await this.findOne(storeId, id);
    if (theme.role === 'MAIN') {
      throw new BadRequestException('Cannot delete the main theme');
    }
    return this.prisma.theme.delete({ where: { id } });
  }
}
