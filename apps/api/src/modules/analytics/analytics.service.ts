import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(storeId: string, startDate?: string, endDate?: string) {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const [revenueAgg, customerCount] = await Promise.all([
      this.prisma.order.aggregate({
        where: { storeId, financialStatus: 'PAID', ...dateFilter },
        _sum: { totalPrice: true },
        _count: { id: true },
      }),
      this.prisma.customer.count({ where: { storeId } }),
    ]);

    const totalRevenue = Number(revenueAgg._sum.totalPrice ?? 0);
    const totalOrders = revenueAgg._count.id;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalRevenue,
      totalOrders,
      totalCustomers: customerCount,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    };
  }

  async getSales(storeId: string, startDate?: string, endDate?: string, groupBy = 'day') {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const format = groupBy === 'month' ? 'YYYY-MM' : groupBy === 'week' ? 'IYYY-IW' : 'YYYY-MM-DD';

    const rows = await this.prisma.$queryRaw<Array<{ date: string; revenue: string; orders: bigint }>>`
      SELECT
        TO_CHAR("createdAt" AT TIME ZONE 'UTC', ${format}) as date,
        COALESCE(SUM("totalPrice"), 0) as revenue,
        COUNT(*) as orders
      FROM orders
      WHERE "storeId" = ${storeId}
        AND "financialStatus" = 'PAID'
        AND "createdAt" >= ${start}
        AND "createdAt" <= ${end}
      GROUP BY 1
      ORDER BY 1
    `;

    return rows.map((r) => ({
      date: r.date,
      revenue: Number(r.revenue),
      orders: Number(r.orders),
    }));
  }

  async getTopProducts(storeId: string, limit = 10) {
    const rows = await this.prisma.$queryRaw<Array<{ productId: string; title: string; totalSold: bigint; revenue: string }>>`
      SELECT
        oli."productId",
        p.title,
        SUM(oli.quantity) as "totalSold",
        SUM(oli.quantity * oli.price) as revenue
      FROM order_line_items oli
      JOIN orders o ON o.id = oli."orderId"
      JOIN products p ON p.id = oli."productId"
      WHERE o."storeId" = ${storeId}
        AND o."financialStatus" = 'PAID'
        AND oli."productId" IS NOT NULL
      GROUP BY oli."productId", p.title
      ORDER BY revenue DESC
      LIMIT ${limit}
    `;

    return rows.map((r) => ({
      productId: r.productId,
      title: r.title,
      totalSold: Number(r.totalSold),
      revenue: Number(r.revenue),
    }));
  }

  async getCustomerMetrics(storeId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [newCustomers, returningCustomers, topCustomers] = await Promise.all([
      this.prisma.customer.count({
        where: { storeId, createdAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.customer.count({
        where: { storeId, totalOrders: { gt: 1 } },
      }),
      this.prisma.customer.findMany({
        where: { storeId },
        orderBy: { totalSpent: 'desc' },
        take: 5,
        select: { id: true, firstName: true, lastName: true, email: true, totalSpent: true, totalOrders: true },
      }),
    ]);

    return {
      newCustomers,
      returningCustomers,
      topCustomers: topCustomers.map((c) => ({ ...c, totalSpent: Number(c.totalSpent) })),
    };
  }

  private buildDateFilter(startDate?: string, endDate?: string) {
    if (!startDate && !endDate) return {};
    return {
      createdAt: {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      },
    };
  }
}
