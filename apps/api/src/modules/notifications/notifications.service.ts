import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(storeId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: {
        storeId,
        ...(unreadOnly && { readAt: null }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUnreadCount(storeId: string) {
    const count = await this.prisma.notification.count({
      where: { storeId, readAt: null },
    });
    return { count };
  }

  async markRead(storeId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({ where: { id, storeId } });
    if (!notification) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(storeId: string) {
    return this.prisma.notification.updateMany({
      where: { storeId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async remove(storeId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({ where: { id, storeId } });
    if (!notification) throw new NotFoundException('Notification not found');
    return this.prisma.notification.delete({ where: { id } });
  }

  async create(storeId: string, type: string, title: string, message: string, data?: Record<string, any>) {
    return this.prisma.notification.create({
      data: {
        storeId,
        type: type as any,
        title,
        message,
        data: data ?? {},
      },
    });
  }
}
