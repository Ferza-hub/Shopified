import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StoreContextGuard } from '../../common/guards/store-context.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StoreContextGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications' })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  findAll(
    @CurrentStore() store: { id: string },
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationsService.findAll(store.id, unreadOnly === 'true');
  }

  @Get('count')
  @ApiOperation({ summary: 'Get unread notification count' })
  getCount(@CurrentStore() store: { id: string }) {
    return this.notificationsService.getUnreadCount(store.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markRead(@CurrentStore() store: { id: string }, @Param('id') id: string) {
    return this.notificationsService.markRead(store.id, id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllRead(@CurrentStore() store: { id: string }) {
    return this.notificationsService.markAllRead(store.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a notification' })
  remove(@CurrentStore() store: { id: string }, @Param('id') id: string) {
    return this.notificationsService.remove(store.id, id);
  }
}
