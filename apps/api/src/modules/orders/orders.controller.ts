import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StoreContextGuard } from '../../common/guards/store-context.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { FulfillOrderDto } from './dto/fulfill-order.dto';
import { RefundOrderDto } from './dto/refund-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StoreContextGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List orders with pagination and filters' })
  findAll(
    @CurrentStore() storeId: string,
    @Query() query: OrderQueryDto,
  ) {
    return this.ordersService.findAll(storeId, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create order manually' })
  create(
    @CurrentStore() storeId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(storeId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full order with lineItems, fulfillments, payments, taxLines' })
  findOne(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
  ) {
    return this.ordersService.findOne(storeId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order note/tags' })
  update(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
    @Body() body: { note?: string; tags?: string[] },
  ) {
    return this.ordersService.update(storeId, id, body);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel order' })
  cancel(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
  ) {
    return this.ordersService.cancel(storeId, id, dto);
  }

  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Close order' })
  close(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
  ) {
    return this.ordersService.close(storeId, id);
  }

  @Post(':id/fulfill')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create fulfillment for order' })
  fulfill(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
    @Body() dto: FulfillOrderDto,
  ) {
    return this.ordersService.fulfill(storeId, id, dto);
  }

  @Post(':id/refund')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Process refund for order' })
  refund(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
    @Body() dto: RefundOrderDto,
  ) {
    return this.ordersService.refund(storeId, id, dto);
  }
}
