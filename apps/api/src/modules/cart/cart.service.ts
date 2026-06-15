import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate(storeId: string, sessionId: string, customerId?: string) {
    // Try to find existing cart
    const where: any = { storeId };
    if (customerId) {
      where.customerId = customerId;
    } else {
      where.sessionId = sessionId;
    }

    let cart = await this.prisma.cart.findFirst({
      where,
      include: {
        items: {
          include: {
            variant: { include: { product: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          storeId,
          sessionId,
          customerId,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        include: {
          items: {
            include: {
              variant: { include: { product: true } },
            },
          },
        },
      });
    }

    return cart;
  }

  async addItem(cartId: string, dto: AddItemDto) {
    // Verify cart exists
    const cart = await this.prisma.cart.findUnique({ where: { id: cartId } });
    if (!cart) {
      throw new NotFoundException(`Cart ${cartId} not found`);
    }

    // Check variant exists and has stock
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
      include: {
        inventoryItem: {
          include: { inventoryLevels: true },
        },
      },
    });

    if (!variant) {
      throw new NotFoundException(`Variant ${dto.variantId} not found`);
    }

    // Check if any inventory level has available stock
    const totalAvailable = variant.inventoryItem?.inventoryLevels?.reduce(
      (sum, level) => sum + level.available,
      0,
    ) ?? 0;

    if (totalAvailable <= 0) {
      throw new BadRequestException('Product variant is out of stock');
    }

    // Check if item already in cart
    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId, variantId: dto.variantId },
    });

    let item;
    if (existingItem) {
      item = await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + dto.quantity },
      });
    } else {
      item = await this.prisma.cartItem.create({
        data: {
          cartId,
          variantId: dto.variantId,
          quantity: dto.quantity,
          price: variant.price,
          properties: dto.properties ?? {},
        },
      });
    }

    return this.recalculate(cartId);
  }

  async updateItem(cartId: string, itemId: string, dto: UpdateItemDto) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId },
    });

    if (!item) {
      throw new NotFoundException(`Cart item ${itemId} not found`);
    }

    if (dto.quantity === 0) {
      await this.prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await this.prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: dto.quantity },
      });
    }

    return this.recalculate(cartId);
  }

  async removeItem(cartId: string, itemId: string) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId },
    });

    if (!item) {
      throw new NotFoundException(`Cart item ${itemId} not found`);
    }

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.recalculate(cartId);
  }

  async applyDiscount(cartId: string, code: string, storeId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { id: cartId } });
    if (!cart) {
      throw new NotFoundException(`Cart ${cartId} not found`);
    }

    // Validate discount code
    const discount = await this.prisma.discount.findFirst({
      where: {
        storeId,
        code,
        isEnabled: true,
      },
    });

    if (!discount) {
      throw new NotFoundException(`Discount code '${code}' not found or not valid`);
    }

    const now = new Date();
    if (discount.startsAt > now) {
      throw new BadRequestException('Discount code is not yet active');
    }
    if (discount.endsAt && discount.endsAt < now) {
      throw new BadRequestException('Discount code has expired');
    }

    // Add code if not already applied
    const codes = cart.discountCodes as string[];
    if (!codes.includes(code)) {
      codes.push(code);
      await this.prisma.cart.update({
        where: { id: cartId },
        data: { discountCodes: codes },
      });
    }

    return this.recalculate(cartId);
  }

  async removeDiscount(cartId: string, code: string) {
    const cart = await this.prisma.cart.findUnique({ where: { id: cartId } });
    if (!cart) {
      throw new NotFoundException(`Cart ${cartId} not found`);
    }

    const codes = (cart.discountCodes as string[]).filter((c) => c !== code);
    await this.prisma.cart.update({
      where: { id: cartId },
      data: { discountCodes: codes },
    });

    return this.recalculate(cartId);
  }

  async recalculate(cartId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: true },
    });

    if (!cart) {
      throw new NotFoundException(`Cart ${cartId} not found`);
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    const shipping = Number(cart.shipping ?? 0);
    const tax = Number(cart.tax ?? 0);
    const discount = Number(cart.discount ?? 0);
    const total = Math.max(0, subtotal - discount + shipping + tax);

    return this.prisma.cart.update({
      where: { id: cartId },
      data: { subtotal, total },
      include: {
        items: {
          include: {
            variant: { include: { product: true } },
          },
        },
      },
    });
  }
}
