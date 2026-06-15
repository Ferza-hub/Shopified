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
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { StoreContextGuard } from '../../common/guards/store-context.guard';
import { InventoryService } from './inventory.service';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { SetInventoryDto } from './dto/set-inventory.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(StoreContextGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'List inventory levels for the store' })
  @ApiQuery({ name: 'locationId', required: false, type: String })
  @ApiQuery({ name: 'variantId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of inventory levels' })
  findAll(
    @CurrentStore() storeId: string,
    @Query('locationId') locationId?: string,
    @Query('variantId') variantId?: string,
  ) {
    return this.inventoryService.findAll(storeId, { locationId, variantId });
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Adjust inventory level by a relative amount' })
  @ApiResponse({ status: 200, description: 'Updated inventory level' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  adjust(
    @CurrentStore() storeId: string,
    @Body() dto: AdjustInventoryDto,
  ) {
    return this.inventoryService.adjust(storeId, dto);
  }

  @Post('set')
  @ApiOperation({ summary: 'Set inventory level to an absolute quantity' })
  @ApiResponse({ status: 200, description: 'Updated inventory level' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  set(
    @CurrentStore() storeId: string,
    @Body() dto: SetInventoryDto,
  ) {
    return this.inventoryService.set(storeId, dto);
  }

  @Get('locations')
  @ApiOperation({ summary: 'List all locations for the store' })
  @ApiResponse({ status: 200, description: 'List of locations' })
  getLocations(@CurrentStore() storeId: string) {
    return this.inventoryService.getLocations(storeId);
  }

  @Post('locations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new location' })
  @ApiResponse({ status: 201, description: 'Location created' })
  createLocation(
    @CurrentStore() storeId: string,
    @Body() dto: CreateLocationDto,
  ) {
    return this.inventoryService.createLocation(storeId, dto);
  }

  @Patch('locations/:id')
  @ApiOperation({ summary: 'Update a location' })
  @ApiResponse({ status: 200, description: 'Updated location' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  updateLocation(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.inventoryService.updateLocation(storeId, id, dto);
  }

  @Delete('locations/:id')
  @ApiOperation({ summary: 'Deactivate a location' })
  @ApiResponse({ status: 200, description: 'Deactivated location' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  deactivateLocation(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
  ) {
    return this.inventoryService.deactivateLocation(storeId, id);
  }
}
