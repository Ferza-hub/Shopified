import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  UnauthorizedException,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { StorefrontService } from './storefront.service';

@ApiTags('Storefront')
@Public()
@Controller('storefront')
export class StorefrontController {
  constructor(private readonly sf: StorefrontService) {}

  private getStoreId(headers: Record<string, string>): string {
    const id = headers['x-store-id'];
    if (!id) throw new UnauthorizedException('x-store-id header is required');
    return id;
  }

  @Get('products')
  @ApiOperation({ summary: 'List active products (public)' })
  getProducts(
    @Headers() headers: Record<string, string>,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
    @Query('search') search?: string,
    @Query('productType') productType?: string,
  ) {
    return this.sf.getProducts(this.getStoreId(headers), {
      limit: limit ? +limit : undefined,
      page: page ? +page : undefined,
      search,
      productType,
    });
  }

  @Get('products/:handle')
  @ApiOperation({ summary: 'Get a product by handle (public)' })
  getProduct(
    @Headers() headers: Record<string, string>,
    @Param('handle') handle: string,
  ) {
    return this.sf.getProductByHandle(this.getStoreId(headers), handle);
  }

  @Get('collections')
  @ApiOperation({ summary: 'List all collections (public)' })
  getCollections(@Headers() headers: Record<string, string>) {
    return this.sf.getCollections(this.getStoreId(headers));
  }

  @Get('collections/:handle')
  @ApiOperation({ summary: 'Get a collection by handle with products (public)' })
  getCollection(
    @Headers() headers: Record<string, string>,
    @Param('handle') handle: string,
  ) {
    return this.sf.getCollectionByHandle(this.getStoreId(headers), handle);
  }

  @Post('customers/login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Customer login (public)' })
  customerLogin(
    @Headers() headers: Record<string, string>,
    @Body() body: { email: string; password: string },
  ) {
    return this.sf.customerLogin(this.getStoreId(headers), body.email, body.password);
  }

  @Get('customers/me')
  @ApiOperation({ summary: 'Get current customer profile (customer token required)' })
  async getCustomer(@Headers() headers: Record<string, string>) {
    const token = headers['authorization']?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('Customer token required');
    const payload = await this.sf.verifyCustomerToken(token);
    return this.sf.getCustomer(payload.sub, this.getStoreId(headers));
  }

  @Get('customers/me/orders')
  @ApiOperation({ summary: 'Get orders for current customer (customer token required)' })
  async getCustomerOrders(@Headers() headers: Record<string, string>) {
    const token = headers['authorization']?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('Customer token required');
    const payload = await this.sf.verifyCustomerToken(token);
    return this.sf.getCustomerOrders(payload.sub, this.getStoreId(headers));
  }

  @Post('orders')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create order from checkout (public)' })
  createOrder(
    @Headers() headers: Record<string, string>,
    @Body() dto: any,
  ) {
    return this.sf.createOrder(this.getStoreId(headers), dto);
  }
}
