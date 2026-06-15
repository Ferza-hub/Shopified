import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';
import { IsArray, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { StoreContextGuard } from '../../common/guards/store-context.guard';

class BulkUpdateStatusDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  productIds: string[];

  @ApiProperty({ enum: ProductStatus })
  @IsEnum(ProductStatus)
  status: ProductStatus;
}

class AddImageDto {
  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty({ required: false })
  altText?: string;

  @ApiProperty({ required: false })
  position?: number;
}

class AddProductToCollectionDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty({ required: false })
  position?: number;
}

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(StoreContextGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List all products for the current store' })
  @ApiResponse({ status: 200, description: 'Paginated list of products' })
  findAll(
    @CurrentStore() storeId: string,
    @Query() query: ProductQueryDto,
  ) {
    return this.productsService.findAll(storeId, query);
  }

  /**
   * IMPORTANT: POST /products/bulk must be declared BEFORE GET /products/:id
   * so NestJS does not treat "bulk" as an :id parameter.
   */
  @Post('bulk')
  @ApiOperation({ summary: 'Bulk update product status' })
  @ApiResponse({ status: 200, description: 'Bulk update result' })
  @ApiBody({ type: BulkUpdateStatusDto })
  bulkUpdateStatus(
    @CurrentStore() storeId: string,
    @Body() body: BulkUpdateStatusDto,
  ) {
    return this.productsService.bulkUpdateStatus(storeId, body.productIds, body.status);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  create(
    @CurrentStore() storeId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(storeId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, description: 'Product details' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
  ) {
    return this.productsService.findOne(storeId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  update(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(storeId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Archive (soft-delete) a product' })
  @ApiResponse({ status: 204, description: 'Product archived' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
  ) {
    return this.productsService.remove(storeId, id);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish a product (set status to ACTIVE)' })
  @ApiResponse({ status: 200, description: 'Product published' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  publish(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
  ) {
    return this.productsService.publish(storeId, id);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive a product (set status to ARCHIVED)' })
  @ApiResponse({ status: 200, description: 'Product archived' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  archive(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
  ) {
    return this.productsService.archive(storeId, id);
  }

  @Get(':id/variants')
  @ApiOperation({ summary: 'List all variants for a product' })
  @ApiResponse({ status: 200, description: 'List of product variants' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  getVariants(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
  ) {
    return this.productsService.getVariants(storeId, id);
  }

  @Post(':id/variants')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a variant for a product' })
  @ApiResponse({ status: 201, description: 'Variant created successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  createVariant(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
    @Body() dto: CreateVariantDto,
  ) {
    return this.productsService.createVariant(storeId, id, dto);
  }

  @Patch(':id/variants/:variantId')
  @ApiOperation({ summary: 'Update a product variant' })
  @ApiResponse({ status: 200, description: 'Variant updated successfully' })
  @ApiResponse({ status: 404, description: 'Product or variant not found' })
  updateVariant(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.productsService.updateVariant(storeId, id, variantId, dto);
  }

  @Delete(':id/variants/:variantId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a product variant' })
  @ApiResponse({ status: 204, description: 'Variant deleted' })
  @ApiResponse({ status: 404, description: 'Product or variant not found' })
  removeVariant(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
    @Param('variantId') variantId: string,
  ) {
    return this.productsService.removeVariant(storeId, id, variantId);
  }

  @Post(':id/images')
  @HttpCode(201)
  @ApiOperation({ summary: 'Add an image to a product' })
  @ApiResponse({ status: 201, description: 'Image added successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiBody({ type: AddImageDto })
  addImage(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
    @Body() body: AddImageDto,
  ) {
    return this.productsService.addImage(storeId, id, body);
  }

  @Delete(':id/images/:imageId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove an image from a product' })
  @ApiResponse({ status: 204, description: 'Image removed' })
  @ApiResponse({ status: 404, description: 'Product or image not found' })
  removeImage(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    return this.productsService.removeImage(storeId, id, imageId);
  }
}
