import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(storeId: string, query: CustomerQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = { storeId };

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.tags && query.tags.length > 0) {
      where.tags = { hasSome: query.tags };
    }

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(storeId: string, dto: CreateCustomerDto & { password?: string }) {
    let passwordHash: string | undefined;
    if (dto.password) {
      passwordHash = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.customer.create({
      data: {
        storeId,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        acceptsMarketing: dto.acceptsMarketing ?? false,
        note: dto.note,
        tags: dto.tags ?? [],
        ...(passwordHash && { passwordHash }),
      },
    });
  }

  async findOne(storeId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, storeId },
      include: {
        addresses: true,
        _count: { select: { orders: true } },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer ${id} not found`);
    }

    return customer;
  }

  async update(storeId: string, id: string, dto: UpdateCustomerDto) {
    await this.findOne(storeId, id);

    return this.prisma.customer.update({
      where: { id },
      data: {
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.acceptsMarketing !== undefined && { acceptsMarketing: dto.acceptsMarketing }),
        ...(dto.note !== undefined && { note: dto.note }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
      },
    });
  }

  async deactivate(storeId: string, id: string) {
    await this.findOne(storeId, id);

    return this.prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getOrders(storeId: string, customerId: string) {
    await this.findOne(storeId, customerId);

    return this.prisma.order.findMany({
      where: { storeId, customerId },
      include: { lineItems: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addAddress(storeId: string, customerId: string, dto: CreateAddressDto) {
    await this.findOne(storeId, customerId);

    if (dto.isDefault) {
      await this.prisma.customerAddress.updateMany({
        where: { customerId },
        data: { isDefault: false },
      });
    }

    return this.prisma.customerAddress.create({
      data: {
        customerId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        company: dto.company,
        address1: dto.address1,
        address2: dto.address2,
        city: dto.city,
        province: dto.province,
        provinceCode: dto.provinceCode,
        country: dto.country,
        countryCode: dto.countryCode,
        zip: dto.zip,
        phone: dto.phone,
        isDefault: dto.isDefault ?? false,
      },
    });
  }

  async updateAddress(storeId: string, customerId: string, addressId: string, dto: Partial<CreateAddressDto>) {
    await this.findOne(storeId, customerId);

    const address = await this.prisma.customerAddress.findFirst({
      where: { id: addressId, customerId },
    });

    if (!address) {
      throw new NotFoundException(`Address ${addressId} not found`);
    }

    return this.prisma.customerAddress.update({
      where: { id: addressId },
      data: { ...dto },
    });
  }

  async deleteAddress(storeId: string, customerId: string, addressId: string) {
    await this.findOne(storeId, customerId);

    const address = await this.prisma.customerAddress.findFirst({
      where: { id: addressId, customerId },
    });

    if (!address) {
      throw new NotFoundException(`Address ${addressId} not found`);
    }

    await this.prisma.customerAddress.delete({ where: { id: addressId } });
  }

  async setDefaultAddress(storeId: string, customerId: string, addressId: string) {
    await this.findOne(storeId, customerId);

    const address = await this.prisma.customerAddress.findFirst({
      where: { id: addressId, customerId },
    });

    if (!address) {
      throw new NotFoundException(`Address ${addressId} not found`);
    }

    await this.prisma.customerAddress.updateMany({
      where: { customerId },
      data: { isDefault: false },
    });

    return this.prisma.customerAddress.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  }
}
