import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from 'class-validator';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { StoreContextGuard } from '../../common/guards/store-context.guard';

class AddProductToCollectionDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  position?: number;
}

@ApiTags('Collections')
@ApiBearerAuth()
@UseGuards(StoreContextGuard)
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all collections for the current store' })
  @ApiResponse({ status: 200, description: 'List of collections' })
  findAll(@CurrentStore() storeId: string) {
    return this.collectionsService.findAll(storeId);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new collection' })
  @ApiResponse({ status: 201, description: 'Collection created successfully' })
  create(
    @CurrentStore() storeId: string,
    @Body() dto: CreateCollectionDto,
  ) {
    return this.collectionsService.create(storeId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a collection by ID with its products' })
  @ApiResponse({ status: 200, description: 'Collection details' })
  @ApiResponse({ status: 404, description: 'Collection not found' })
  findOne(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
  ) {
    return this.collectionsService.findOne(storeId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a collection' })
  @ApiResponse({ status: 200, description: 'Collection updated successfully' })
  @ApiResponse({ status: 404, description: 'Collection not found' })
  update(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
  ) {
    return this.collectionsService.update(storeId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a collection' })
  @ApiResponse({ status: 204, description: 'Collection deleted' })
  @ApiResponse({ status: 404, description: 'Collection not found' })
  remove(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
  ) {
    return this.collectionsService.remove(storeId, id);
  }

  @Post(':id/products')
  @HttpCode(201)
  @ApiOperation({ summary: 'Add a product to a collection' })
  @ApiResponse({ status: 201, description: 'Product added to collection' })
  @ApiResponse({ status: 404, description: 'Collection or product not found' })
  @ApiBody({ type: AddProductToCollectionDto })
  addProduct(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
    @Body() body: AddProductToCollectionDto,
  ) {
    return this.collectionsService.addProduct(
      storeId,
      id,
      body.productId,
      body.position,
    );
  }

  @Delete(':id/products/:productId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove a product from a collection' })
  @ApiResponse({ status: 204, description: 'Product removed from collection' })
  @ApiResponse({ status: 404, description: 'Collection not found' })
  removeProduct(
    @CurrentStore() storeId: string,
    @Param('id') id: string,
    @Param('productId') productId: string,
  ) {
    return this.collectionsService.removeProduct(storeId, id, productId);
  }
}
