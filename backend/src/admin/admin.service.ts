import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.order.count({ where: { deletedAt: null } }),
      this.prisma.order.aggregate({
        where: {
          deletedAt: null,
          status: { in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.CONFIRMED] },
        },
        _sum: { total: true },
      }),
      this.prisma.$queryRaw`
        SELECT id, name, sku, stock, low_stock_alert
        FROM products
        WHERE deleted_at IS NULL AND stock <= low_stock_alert
        LIMIT 10
      ` as Promise<{ id: string; name: string; sku: string; stock: number; low_stock_alert: number }[]>,
      this.prisma.order.findMany({
        where: { deletedAt: null },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } },
      }),
    ]);

    const salesByMonth = await this.prisma.$queryRaw`
      SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as count, SUM(total::numeric) as revenue
      FROM orders
      WHERE deleted_at IS NULL AND status IN ('DELIVERED', 'SHIPPED', 'CONFIRMED')
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
      LIMIT 12
    `;

    return {
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      lowStockProducts,
      recentOrders,
      salesByMonth,
    };
  }
}
