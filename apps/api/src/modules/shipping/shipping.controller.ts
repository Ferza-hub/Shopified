import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StoreContextGuard } from '../../common/guards/store-context.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { ShippingService } from './shipping.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { CreateRateDto } from './dto/create-rate.dto';
import { UpdateRateDto } from './dto/update-rate.dto';
import { CalculateShippingDto } from './dto/calculate-shipping.dto';

@ApiTags('shipping')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StoreContextGuard)
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get('zones')
  @ApiOperation({ summary: 'List all shipping zones with rates' })
  findAllZones(@CurrentStore() storeId: string) {
    return this.shippingService.findAllZones(storeId);
  }

  @Post('zones')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a shipping zone' })
  createZone(
    @CurrentStore() storeId: string,
    @Body() dto: CreateZoneDto,
  ) {
    return this.shippingService.createZone(storeId, dto);
  }

  @Patch('zones/:id')
  @ApiOperation({ summary: 'Update a shipping zone' })
  updateZone(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateZoneDto,
  ) {
    return this.shippingService.updateZone(storeId, id, dto);
  }

  @Delete('zones/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a shipping zone' })
  deleteZone(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
  ) {
    return this.shippingService.deleteZone(storeId, id);
  }

  @Post('zones/:id/rates')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a shipping rate to a zone' })
  addRate(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
    @Body() dto: CreateRateDto,
  ) {
    return this.shippingService.addRate(storeId, id, dto);
  }

  @Patch('zones/:id/rates/:rateId')
  @ApiOperation({ summary: 'Update a shipping rate' })
  updateRate(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
    @Param('rateId') rateId: string,
    @Body() dto: UpdateRateDto,
  ) {
    return this.shippingService.updateRate(storeId, id, rateId, dto);
  }

  @Delete('zones/:id/rates/:rateId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a shipping rate' })
  deleteRate(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
    @Param('rateId') rateId: string,
  ) {
    return this.shippingService.deleteRate(storeId, id, rateId);
  }

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate available shipping rates for a destination' })
  calculateRates(
    @CurrentStore() storeId: string,
    @Body() dto: CalculateShippingDto,
  ) {
    return this.shippingService.calculateRates(storeId, dto);
  }
}
