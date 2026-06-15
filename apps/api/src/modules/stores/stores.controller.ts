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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { StoreContextGuard } from '../../common/guards/store-context.guard';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@ApiTags('stores')
@ApiBearerAuth()
@UseGuards(StoreContextGuard)
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new store' })
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateStoreDto,
  ) {
    return this.storesService.createStore(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all stores for the current user' })
  findAll(@CurrentUser('sub') userId: string) {
    return this.storesService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a store by ID' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.storesService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a store' })
  update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateStoreDto,
  ) {
    return this.storesService.update(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a store' })
  remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.storesService.remove(id, userId);
  }

  @Get(':id/settings')
  @ApiOperation({ summary: 'Get store settings' })
  getSettings(@Param('id') id: string) {
    return this.storesService.getSettings(id);
  }

  @Patch(':id/settings')
  @ApiOperation({ summary: 'Update store settings' })
  updateSettings(
    @Param('id') id: string,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.storesService.updateSettings(id, dto);
  }
}
