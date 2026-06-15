import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { FulfillOrderDto } from './dto/fulfill-order.dto';
import { RefundOrderDto } from './dto/refund-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { FulfillmentStatus, FinancialStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(storeId: string, query: OrderQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = { storeId };
    if (query.status) where.status = query.status;
    if (query.financialStatus) where.financialStatus = query.financialStatus;
    if (query.fulfillmentStatus) where.fulfillmentStatus = query.fulfillmentStatus;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: { lineItems: true, customer: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(storeId: string, dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      // Generate order number: find max for store + 1, start at 1001
      const maxOrder = await tx.order.findFirst({
        where: { storeId },
        orderBy: { orderNumber: 'desc' },
        select: { orderNumber: true },
      });
      const orderNumber = (maxOrder?.orderNumber ?? 1000) + 1;
      const name = `#${orderNumber}`;

      // Fetch variants and product info for line items
      const variantIds = dto.lineItems.map((li) => li.variantId);
      const variants = await tx.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: { product: true, inventoryItem: { include: { inventoryLevels: true } } },
      });

      // Calculate totals
      let subtotalPrice = 0;
      for (const li of dto.lineItems) {
        subtotalPrice += li.price * li.quantity;
      }

      const order = await tx.order.create({
        data: {
          storeId,
          customerId: dto.customerId,
          orderNumber,
          name,
          email: dto.email,
          status: 'PENDING',
          financialStatus: 'PENDING',
          fulfillmentStatus: 'UNFULFILLED',
          subtotalPrice,
          totalPrice: subtotalPrice,
          note: dto.note,
          tags: dto.tags ?? [],
          discountCodes: dto.discountCodes ?? [],
          shippingAddress: dto.shippingAddress,
          processedAt: new Date(),
          lineItems: {
            create: dto.lineItems.map((li) => {
              const variant = variants.find((v) => v.id === li.variantId);
              return {
                variantId: li.variantId,
                productId: variant?.productId,
                title: variant?.product?.title ?? 'Unknown Product',
                variantTitle: variant?.title,
                sku: variant?.sku,
                quantity: li.quantity,
                price: li.price,
                fulfillableQuantity: li.quantity,
              };
            }),
          },
        },
        include: { lineItems: true },
      });

      // Decrement inventory for each variant
      for (const li of dto.lineItems) {
        const variant = variants.find((v) => v.id === li.variantId);
        if (variant?.inventoryItem?.inventoryLevels?.length) {
          const level = variant.inventoryItem.inventoryLevels[0];
          await tx.inventoryLevel.update({
            where: { id: level.id },
            data: {
              available: { decrement: li.quantity },
              committed: { increment: li.quantity },
            },
          });
        }
      }

      return order;
    });
  }

  async findOne(storeId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, storeId },
      include: {
        lineItems: true,
        fulfillments: { include: { items: true } },
        payments: true,
        taxLines: true,
        customer: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return order;
  }

  async update(storeId: string, id: string, data: { note?: string; tags?: string[] }) {
    await this.findOne(storeId, id);
    return this.prisma.order.update({
      where: { id },
      data: {
        ...(data.note !== undefined && { note: data.note }),
        ...(data.tags !== undefined && { tags: data.tags }),
      },
    });
  }

  async cancel(storeId: string, id: string, dto: CancelOrderDto) {
    const order = await this.findOne(storeId, id);

    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Order is already cancelled');
    }

    return this.prisma.$transaction(async (tx) => {
      // Restore inventory
      for (const lineItem of order.lineItems) {
        if (lineItem.variantId) {
          const inventoryItem = await tx.inventoryItem.findUnique({
            where: { variantId: lineItem.variantId },
            include: { inventoryLevels: true },
          });
          if (inventoryItem?.inventoryLevels?.length) {
            const level = inventoryItem.inventoryLevels[0];
            await tx.inventoryLevel.update({
              where: { id: level.id },
              data: {
                available: { increment: lineItem.quantity },
                committed: { decrement: lineItem.quantity },
              },
            });
          }
        }
      }

      return tx.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelReason: dto.reason,
        },
      });
    });
  }

  async close(storeId: string, id: string) {
    await this.findOne(storeId, id);
    return this.prisma.order.update({
      where: { id },
      data: { status: 'CLOSED', closedAt: new Date() },
    });
  }

  async fulfill(storeId: string, id: string, dto: FulfillOrderDto) {
    const order = await this.findOne(storeId, id);

    return this.prisma.$transaction(async (tx) => {
      const fulfillment = await tx.orderFulfillment.create({
        data: {
          orderId: id,
          status: 'FULFILLED',
          trackingNumber: dto.trackingNumber,
          trackingCompany: dto.trackingCompany,
          trackingUrl: dto.trackingUrl,
          shippedAt: new Date(),
          items: {
            create: dto.lineItems.map((li) => ({
              lineItemId: li.lineItemId,
              quantity: li.quantity,
            })),
          },
        },
        include: { items: true },
      });

      // Update fulfilled quantities
      for (const li of dto.lineItems) {
        await tx.orderLineItem.update({
          where: { id: li.lineItemId },
          data: { fulfilledQuantity: { increment: li.quantity } },
        });
      }

      // Check if all items are fulfilled
      const updatedLineItems = await tx.orderLineItem.findMany({
        where: { orderId: id },
      });

      const allFulfilled = updatedLineItems.every(
        (item) => item.fulfilledQuantity >= item.fulfillableQuantity,
      );

      const partiallyFulfilled = updatedLineItems.some(
        (item) => item.fulfilledQuantity > 0,
      );

      let fulfillmentStatus: FulfillmentStatus = order.fulfillmentStatus as FulfillmentStatus;
      if (allFulfilled) {
        fulfillmentStatus = 'FULFILLED';
      } else if (partiallyFulfilled) {
        fulfillmentStatus = 'PARTIALLY_FULFILLED';
      }

      await tx.order.update({
        where: { id },
        data: { fulfillmentStatus },
      });

      return fulfillment;
    });
  }

  async refund(storeId: string, id: string, dto: RefundOrderDto) {
    const order = await this.findOne(storeId, id);

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          orderId: id,
          amount: -Math.abs(dto.amount),
          currency: order.currency,
          status: 'REFUNDED',
          gateway: 'refund',
          processedAt: new Date(),
        },
      });

      // Determine new financial status
      const totalRefunded = Math.abs(dto.amount);
      const totalPrice = Number(order.totalPrice);
      let financialStatus: FinancialStatus;

      if (totalRefunded >= totalPrice) {
        financialStatus = 'REFUNDED';
      } else {
        financialStatus = 'PARTIALLY_REFUNDED';
      }

      await tx.order.update({
        where: { id },
        data: { financialStatus },
      });

      return payment;
    });
  }
}
