import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class StorefrontService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async getProducts(
    storeId: string,
    params: { limit?: number; page?: number; search?: string; productType?: string },
  ) {
    const limit = Math.min(params.limit ?? 20, 100);
    const page = params.page ?? 1;
    const skip = (page - 1) * limit;

    const where: any = { storeId, status: 'ACTIVE' };
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.productType) where.productType = params.productType;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          images: { take: 1, orderBy: { position: 'asc' } },
          variants: { take: 1, orderBy: { position: 'asc' } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, total, page, limit };
  }

  async getProductByHandle(storeId: string, handle: string) {
    const product = await this.prisma.product.findFirst({
      where: { storeId, handle, status: 'ACTIVE' },
      include: {
        images: { orderBy: { position: 'asc' } },
        variants: { orderBy: { position: 'asc' } },
        options: {
          include: { values: { orderBy: { position: 'asc' } } },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!product) throw new NotFoundException('Product not found');

    const reviews = await this.prisma.review.findMany({
      where: { storeId, productId: product.id, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Normalize options to string[] values for the storefront
    const normalizedOptions = product.options.map((opt) => ({
      id: opt.id,
      name: opt.name,
      position: opt.position,
      values: opt.values.map((v) => v.value),
    }));

    return { ...product, options: normalizedOptions, reviews };
  }

  async getCollections(storeId: string) {
    return this.prisma.collection.findMany({
      where: { storeId },
      include: {
        products: {
          include: { product: { include: { images: { take: 1 } } } },
          take: 4,
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getCollectionByHandle(storeId: string, handle: string) {
    const collection = await this.prisma.collection.findFirst({
      where: { storeId, handle },
      include: {
        products: {
          include: {
            product: {
              include: {
                images: { take: 1, orderBy: { position: 'asc' } },
                variants: { take: 1, orderBy: { position: 'asc' } },
              },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!collection) throw new NotFoundException('Collection not found');
    return collection;
  }

  async customerLogin(storeId: string, email: string, password: string) {
    const customer = await this.prisma.customer.findFirst({ where: { storeId, email } });
    if (!customer?.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, customer.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwt.sign(
      { sub: customer.id, storeId, type: 'customer' },
      { secret: this.config.get('jwt.accessSecret'), expiresIn: '7d' },
    );

    return {
      token,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
      },
    };
  }

  async verifyCustomerToken(token: string) {
    try {
      const payload = this.jwt.verify(token, {
        secret: this.config.get('jwt.accessSecret'),
      }) as any;
      if (payload.type !== 'customer') throw new Error('not a customer token');
      return payload as { sub: string; storeId: string };
    } catch {
      throw new UnauthorizedException('Invalid customer token');
    }
  }

  async getCustomer(customerId: string, storeId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, storeId },
      include: { addresses: true },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    const { passwordHash: _, ...safe } = customer;
    return safe;
  }

  async getCustomerOrders(customerId: string, storeId: string) {
    return this.prisma.order.findMany({
      where: { customerId, storeId },
      include: {
        lineItems: {
          include: {
            variant: {
              include: {
                product: { select: { title: true, images: { take: 1, orderBy: { position: 'asc' } } } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createOrder(storeId: string, dto: any) {
    return this.ordersService.create(storeId, dto);
  }
}
