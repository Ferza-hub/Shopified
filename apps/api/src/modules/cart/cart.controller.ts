import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StoreContextGuard } from '../../common/guards/store-context.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CartService } from './cart.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ApplyDiscountDto } from './dto/apply-discount.dto';

@ApiTags('cart')
@ApiBearerAuth()
@ApiHeader({ name: 'x-session-id', description: 'Session ID for guest cart', required: false })
@UseGuards(JwtAuthGuard, StoreContextGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get or create cart for the current session/customer' })
  getCart(
    @CurrentStore() storeId: string,
    @Headers('x-session-id') sessionId: string,
    @CurrentUser('sub') customerId?: string,
  ) {
    return this.cartService.getOrCreate(storeId, sessionId ?? 'anonymous', customerId);
  }

  @Post('items')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add item to cart' })
  async addItem(
    @CurrentStore() storeId: string,
    @Headers('x-session-id') sessionId: string,
    @CurrentUser('sub') customerId: string | undefined,
    @Body() dto: AddItemDto,
  ) {
    const cart = await this.cartService.getOrCreate(storeId, sessionId ?? 'anonymous', customerId);
    return this.cartService.addItem(cart.id, dto);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  updateItem(
    @Param('itemId') itemId: string,
    @Headers('x-session-id') sessionId: string,
    @CurrentStore() storeId: string,
    @CurrentUser('sub') customerId: string | undefined,
    @Body() dto: UpdateItemDto,
  ) {
    // We need the cartId - get cart first then update
    return this.cartService.getOrCreate(storeId, sessionId ?? 'anonymous', customerId).then(
      (cart) => this.cartService.updateItem(cart.id, itemId, dto),
    );
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove item from cart' })
  removeItem(
    @Param('itemId') itemId: string,
    @Headers('x-session-id') sessionId: string,
    @CurrentStore() storeId: string,
    @CurrentUser('sub') customerId: string | undefined,
  ) {
    return this.cartService.getOrCreate(storeId, sessionId ?? 'anonymous', customerId).then(
      (cart) => this.cartService.removeItem(cart.id, itemId),
    );
  }

  @Post('discounts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apply discount code to cart' })
  applyDiscount(
    @CurrentStore() storeId: string,
    @Headers('x-session-id') sessionId: string,
    @CurrentUser('sub') customerId: string | undefined,
    @Body() dto: ApplyDiscountDto,
  ) {
    return this.cartService.getOrCreate(storeId, sessionId ?? 'anonymous', customerId).then(
      (cart) => this.cartService.applyDiscount(cart.id, dto.code, storeId),
    );
  }

  @Delete('discounts/:code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove discount code from cart' })
  removeDiscount(
    @Param('code') code: string,
    @CurrentStore() storeId: string,
    @Headers('x-session-id') sessionId: string,
    @CurrentUser('sub') customerId: string | undefined,
  ) {
    return this.cartService.getOrCreate(storeId, sessionId ?? 'anonymous', customerId).then(
      (cart) => this.cartService.removeDiscount(cart.id, code),
    );
  }

  @Post('recalculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recalculate cart totals' })
  recalculate(
    @CurrentStore() storeId: string,
    @Headers('x-session-id') sessionId: string,
    @CurrentUser('sub') customerId: string | undefined,
  ) {
    return this.cartService.getOrCreate(storeId, sessionId ?? 'anonymous', customerId).then(
      (cart) => this.cartService.recalculate(cart.id),
    );
  }
}
