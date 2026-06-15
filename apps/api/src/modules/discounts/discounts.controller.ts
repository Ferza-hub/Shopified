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
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { ValidateDiscountDto } from './dto/validate-discount.dto';

@ApiTags('discounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StoreContextGuard)
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Get()
  @ApiOperation({ summary: 'List all discounts for the store' })
  findAll(@CurrentStore() storeId: string) {
    return this.discountsService.findAll(storeId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new discount' })
  create(
    @CurrentStore() storeId: string,
    @Body() dto: CreateDiscountDto,
  ) {
    return this.discountsService.create(storeId, dto);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate a discount code for a cart' })
  validate(
    @CurrentStore() storeId: string,
    @Body() dto: ValidateDiscountDto,
  ) {
    return this.discountsService.validate(storeId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get discount with usage count' })
  findOne(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
  ) {
    return this.discountsService.findOne(storeId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update discount' })
  update(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDiscountDto,
  ) {
    return this.discountsService.update(storeId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete discount' })
  remove(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
  ) {
    return this.discountsService.remove(storeId, id);
  }
}
