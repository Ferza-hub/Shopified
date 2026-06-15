import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { ValidateDiscountDto } from './dto/validate-discount.dto';

@Injectable()
export class DiscountsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(storeId: string) {
    return this.prisma.discount.findMany({
      where: { storeId },
      include: { _count: { select: { usages: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(storeId: string, dto: CreateDiscountDto) {
    return this.prisma.discount.create({
      data: {
        storeId,
        title: dto.title,
        code: dto.code,
        type: dto.type,
        valueType: dto.valueType,
        value: dto.value,
        minimumPurchaseAmount: dto.minimumPurchaseAmount,
        usageLimit: dto.usageLimit,
        perCustomerUsageLimit: dto.perCustomerUsageLimit,
        startsAt: new Date(dto.startsAt),
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        isEnabled: dto.isEnabled ?? true,
      },
    });
  }

  async findOne(storeId: string, id: string) {
    const discount = await this.prisma.discount.findFirst({
      where: { id, storeId },
      include: { _count: { select: { usages: true } } },
    });

    if (!discount) {
      throw new NotFoundException(`Discount ${id} not found`);
    }

    return discount;
  }

  async update(storeId: string, id: string, dto: UpdateDiscountDto) {
    await this.findOne(storeId, id);

    return this.prisma.discount.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.code !== undefined && { code: dto.code }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.valueType !== undefined && { valueType: dto.valueType }),
        ...(dto.value !== undefined && { value: dto.value }),
        ...(dto.minimumPurchaseAmount !== undefined && { minimumPurchaseAmount: dto.minimumPurchaseAmount }),
        ...(dto.usageLimit !== undefined && { usageLimit: dto.usageLimit }),
        ...(dto.perCustomerUsageLimit !== undefined && { perCustomerUsageLimit: dto.perCustomerUsageLimit }),
        ...(dto.startsAt !== undefined && { startsAt: new Date(dto.startsAt) }),
        ...(dto.endsAt !== undefined && { endsAt: new Date(dto.endsAt) }),
        ...(dto.isEnabled !== undefined && { isEnabled: dto.isEnabled }),
      },
    });
  }

  async remove(storeId: string, id: string) {
    await this.findOne(storeId, id);
    await this.prisma.discount.delete({ where: { id } });
  }

  async validate(storeId: string, dto: ValidateDiscountDto) {
    const discount = await this.prisma.discount.findFirst({
      where: { storeId, code: dto.code },
    });

    if (!discount) {
      return { valid: false, discountAmount: 0, message: 'Discount code not found' };
    }

    if (!discount.isEnabled) {
      return { valid: false, discountAmount: 0, message: 'Discount code is not active' };
    }

    const now = new Date();
    if (discount.startsAt > now) {
      return { valid: false, discountAmount: 0, message: 'Discount code is not yet active' };
    }

    if (discount.endsAt && discount.endsAt < now) {
      return { valid: false, discountAmount: 0, message: 'Discount code has expired' };
    }

    // Check usage limit
    if (discount.usageLimit !== null && discount.usageCount >= discount.usageLimit) {
      return { valid: false, discountAmount: 0, message: 'Discount code usage limit reached' };
    }

    // Check per-customer usage limit
    if (discount.perCustomerUsageLimit && dto.customerId) {
      const usageCount = await this.prisma.discountUsage.count({
        where: { discountId: discount.id, customerId: dto.customerId },
      });

      if (usageCount >= discount.perCustomerUsageLimit) {
        return {
          valid: false,
          discountAmount: 0,
          message: 'You have reached the usage limit for this discount code',
        };
      }
    }

    // Check minimum purchase amount
    if (discount.minimumPurchaseAmount !== null) {
      const minAmount = Number(discount.minimumPurchaseAmount);
      if (dto.cartTotal < minAmount) {
        return {
          valid: false,
          discountAmount: 0,
          message: `Minimum purchase amount of ${minAmount} required`,
        };
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    const value = Number(discount.value);

    switch (discount.valueType) {
      case 'PERCENTAGE':
        discountAmount = dto.cartTotal * (value / 100);
        break;
      case 'FIXED_AMOUNT':
        discountAmount = Math.min(value, dto.cartTotal);
        break;
      case 'FREE_SHIPPING':
        discountAmount = 0; // handled separately in shipping calculation
        break;
      case 'BUY_X_GET_Y':
        discountAmount = 0; // complex logic, stub for now
        break;
    }

    return {
      valid: true,
      discountAmount: Math.round(discountAmount * 100) / 100,
      discount,
    };
  }
}
