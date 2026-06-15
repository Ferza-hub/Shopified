import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StoreContextGuard } from '../../common/guards/store-context.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { CheckoutService } from './checkout.service';
import { CompleteCheckoutDto } from './dto/complete-checkout.dto';
import { ShippingAddressDto } from './dto/shipping-address.dto';

@ApiTags('checkout')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StoreContextGuard)
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('from-cart/:cartId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initialize checkout from cart, return checkout summary' })
  initFromCart(
    @CurrentStore() storeId: string,
    @Param('cartId') cartId: string,
  ) {
    return this.checkoutService.initFromCart(storeId, cartId);
  }

  @Post(':cartId/shipping-address')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update shipping address on cart' })
  updateShippingAddress(
    @CurrentStore() storeId: string,
    @Param('cartId') cartId: string,
    @Body() dto: ShippingAddressDto,
  ) {
    return this.checkoutService.updateShippingAddress(storeId, cartId, dto);
  }

  @Get(':cartId/shipping-rates')
  @ApiOperation({ summary: 'Calculate available shipping rates for cart destination' })
  getShippingRates(
    @CurrentStore() storeId: string,
    @Param('cartId') cartId: string,
  ) {
    return this.checkoutService.getShippingRates(storeId, cartId);
  }

  @Post(':cartId/complete')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Complete checkout: validate inventory, create order, clear cart' })
  complete(
    @CurrentStore() storeId: string,
    @Param('cartId') cartId: string,
    @Body() dto: CompleteCheckoutDto,
  ) {
    return this.checkoutService.complete(storeId, cartId, dto);
  }
}
