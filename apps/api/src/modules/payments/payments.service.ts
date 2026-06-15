import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { CreateGatewayDto } from './dto/create-gateway.dto';
import { UpdateGatewayDto } from './dto/update-gateway.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(storeId: string) {
    return this.prisma.payment.findMany({
      where: { order: { storeId } },
      include: { order: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(storeId: string, id: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, order: { storeId } },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${id} not found`);
    }

    return payment;
  }

  async processPayment(storeId: string, dto: ProcessPaymentDto) {
    // Verify order belongs to store
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, storeId },
    });

    if (!order) {
      throw new NotFoundException(`Order ${dto.orderId} not found`);
    }

    const isManual = dto.gateway === 'manual' || dto.gateway === 'cod';

    const payment = await this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        amount: dto.amount,
        currency: order.currency,
        status: isManual ? 'CAPTURED' : 'AUTHORIZED',
        gateway: dto.gateway,
        method: dto.method,
        processedAt: new Date(),
      },
    });

    if (isManual) {
      await this.prisma.order.update({
        where: { id: dto.orderId },
        data: { financialStatus: 'PAID' },
      });
      return payment;
    }

    // For Stripe: return stub client secret
    return {
      ...payment,
      clientSecret: 'pi_stub_secret',
    };
  }

  async refundPayment(storeId: string, paymentId: string, dto: RefundPaymentDto) {
    const payment = await this.findOne(storeId, paymentId);

    const refundPayment = await this.prisma.payment.create({
      data: {
        orderId: payment.orderId,
        amount: -Math.abs(dto.amount),
        currency: payment.currency,
        status: 'REFUNDED',
        gateway: payment.gateway,
        processedAt: new Date(),
      },
    });

    // Update order financial status
    const totalPaid = Number(payment.amount);
    const totalRefunded = Math.abs(dto.amount);
    const financialStatus = totalRefunded >= totalPaid ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

    await this.prisma.order.update({
      where: { id: payment.orderId },
      data: { financialStatus },
    });

    return refundPayment;
  }

  async listGateways(storeId: string) {
    return this.prisma.paymentGateway.findMany({
      where: {
        OR: [
          { storeId },
          { storeId: null },
        ],
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  async createGateway(storeId: string, dto: CreateGatewayDto) {
    return this.prisma.paymentGateway.create({
      data: {
        storeId,
        name: dto.name,
        provider: dto.provider,
        isEnabled: dto.isEnabled ?? false,
        isDefault: dto.isDefault ?? false,
        config: dto.config ?? {},
        credentials: dto.credentials ?? {},
      },
    });
  }

  async updateGateway(storeId: string, id: string, dto: UpdateGatewayDto) {
    const gateway = await this.prisma.paymentGateway.findFirst({
      where: { id, storeId },
    });

    if (!gateway) {
      throw new NotFoundException(`Payment gateway ${id} not found`);
    }

    return this.prisma.paymentGateway.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.provider !== undefined && { provider: dto.provider }),
        ...(dto.isEnabled !== undefined && { isEnabled: dto.isEnabled }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
        ...(dto.config !== undefined && { config: dto.config }),
        ...(dto.credentials !== undefined && { credentials: dto.credentials }),
      },
    });
  }

  async deleteGateway(storeId: string, id: string) {
    const gateway = await this.prisma.paymentGateway.findFirst({
      where: { id, storeId },
    });

    if (!gateway) {
      throw new NotFoundException(`Payment gateway ${id} not found`);
    }

    await this.prisma.paymentGateway.update({
      where: { id },
      data: { isEnabled: false },
    });
  }
}
