import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StoreContextGuard } from '../../common/guards/store-context.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';

@ApiTags('webhooks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StoreContextGuard)
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  @ApiOperation({ summary: 'List webhooks for store' })
  findAll(@CurrentStore() store: { id: string }) {
    return this.webhooksService.findAll(store.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a webhook' })
  create(@CurrentStore() store: { id: string }, @Body() dto: CreateWebhookDto) {
    return this.webhooksService.create(store.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get webhook with last 10 deliveries' })
  findOne(@CurrentStore() store: { id: string }, @Param('id') id: string) {
    return this.webhooksService.findOne(store.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update webhook address/topic' })
  update(@CurrentStore() store: { id: string }, @Param('id') id: string, @Body() dto: CreateWebhookDto) {
    return this.webhooksService.update(store.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a webhook' })
  remove(@CurrentStore() store: { id: string }, @Param('id') id: string) {
    return this.webhooksService.remove(store.id, id);
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Send test payload' })
  test(@CurrentStore() store: { id: string }, @Param('id') id: string) {
    return this.webhooksService.sendTest(store.id, id);
  }
}
