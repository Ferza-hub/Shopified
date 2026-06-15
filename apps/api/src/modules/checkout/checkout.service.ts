import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { CompleteCheckoutDto } from './dto/complete-checkout.dto';
import { ShippingAddressDto } from './dto/shipping-address.dto';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
  ) {}

  async initFromCart(storeId: string, cartId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { id: cartId, storeId },
      include: {
        items: {
          include: {
            variant: { include: { product: true } },
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException(`Cart ${cartId} not found`);
    }

    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    return {
      cartId: cart.id,
      items: cart.items,
      subtotal,
      discount: Number(cart.discount),
      shipping: Number(cart.shipping),
      tax: Number(cart.tax),
      total: Number(cart.total),
      currency: cart.currency,
      discountCodes: cart.discountCodes,
      email: cart.email,
      shippingAddress: (cart as any).shippingAddress ?? null,
    };
  }

  async updateShippingAddress(storeId: string, cartId: string, dto: ShippingAddressDto) {
    const cart = await this.prisma.cart.findFirst({
      where: { id: cartId, storeId },
    });

    if (!cart) {
      throw new NotFoundException(`Cart ${cartId} not found`);
    }

    return this.prisma.cart.update({
      where: { id: cartId },
      data: { shippingAddress: dto } as any,
    });
  }

  async getShippingRates(storeId: string, cartId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { id: cartId, storeId },
      include: { items: true },
    });

    if (!cart) {
      throw new NotFoundException(`Cart ${cartId} not found`);
    }

    const shippingAddress = (cart as any).shippingAddress as any;
    const countryCode = shippingAddress?.countryCode ?? '';

    // Find matching shipping zones
    const zones = await this.prisma.shippingZone.findMany({
      where: {
        storeId,
        OR: [
          { countries: { has: countryCode } },
          { countries: { isEmpty: true } },
        ],
      },
      include: {
        rates: { where: { isActive: true } },
      },
    });

    const cartTotal = Number(cart.total);

    const availableRates = zones.flatMap((zone) =>
      zone.rates.filter((rate) => {
        if (rate.conditionType === 'price') {
          const min = Number(rate.minValue ?? 0);
          const max = Number(rate.maxValue ?? Infinity);
          return cartTotal >= min && cartTotal <= max;
        }
        // If no condition type, always include
        return true;
      }).map((rate) => ({
        id: rate.id,
        name: rate.name,
        price: Number(rate.price),
        carrier: rate.carrier,
        estimatedDays: rate.estimatedDays,
        zoneName: zone.name,
      })),
    ).sort((a, b) => a.price - b.price);

    return availableRates;
  }

  async complete(storeId: string, cartId: string, dto: CompleteCheckoutDto) {
    // Load cart with items
    const cart = await this.prisma.cart.findFirst({
      where: { id: cartId, storeId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                inventoryItem: { include: { inventoryLevels: true } },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException(`Cart ${cartId} not found`);
    }

    if (cart.items.length === 0) {
      throw new BadRequestException('Cannot checkout with an empty cart');
    }

    // Validate inventory for all items
    for (const item of cart.items) {
      const totalAvailable = item.variant.inventoryItem?.inventoryLevels?.reduce(
        (sum, level) => sum + level.available,
        0,
      ) ?? 0;

      if (totalAvailable < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for variant ${item.variantId}. Available: ${totalAvailable}, requested: ${item.quantity}`,
        );
      }
    }

    // Create order from cart
    const order = await this.ordersService.create(storeId, {
      customerId: cart.customerId ?? undefined,
      email: dto.email,
      lineItems: cart.items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        price: Number(item.price),
      })),
      shippingAddress: dto.shippingAddress,
      note: dto.note,
      discountCodes: cart.discountCodes as string[],
    });

    // Clear the cart by deleting all items
    await this.prisma.cartItem.deleteMany({ where: { cartId } });
    await this.prisma.cart.update({
      where: { id: cartId },
      data: { subtotal: 0, total: 0, discount: 0 },
    });

    return order;
  }
}
