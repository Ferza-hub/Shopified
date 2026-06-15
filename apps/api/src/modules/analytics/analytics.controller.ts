import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StoreContextGuard } from '../../common/guards/store-context.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StoreContextGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get key metrics overview' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getOverview(
    @CurrentStore() store: { id: string },
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getOverview(store.id, startDate, endDate);
  }

  @Get('sales')
  @ApiOperation({ summary: 'Get sales over time' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'groupBy', required: false, enum: ['day', 'week', 'month'] })
  getSales(
    @CurrentStore() store: { id: string },
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy?: string,
  ) {
    return this.analyticsService.getSales(store.id, startDate, endDate, groupBy);
  }

  @Get('products')
  @ApiOperation({ summary: 'Get top products by revenue' })
  @ApiQuery({ name: 'limit', required: false })
  getTopProducts(
    @CurrentStore() store: { id: string },
    @Query('limit') limit?: string,
  ) {
    return this.analyticsService.getTopProducts(store.id, limit ? +limit : 10);
  }

  @Get('customers')
  @ApiOperation({ summary: 'Get customer acquisition metrics' })
  getCustomerMetrics(@CurrentStore() store: { id: string }) {
    return this.analyticsService.getCustomerMetrics(store.id);
  }
}
