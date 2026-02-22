import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * AI/ML service - Production placeholders
 * In production: integrate OpenAI, custom ML models, or embedding services
 */

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  /**
   * Frequently bought together - collaborative filtering placeholder
   * Uses order co-occurrence: products often in same order
   */
  async getFrequentlyBoughtTogether(productId: string, limit = 4) {
    const ordersWithProduct = await this.prisma.orderItem.findMany({
      where: { productId },
      select: { orderId: true },
    });
    const orderIds = ordersWithProduct.map((o) => o.orderId);

    if (orderIds.length === 0) return [];

    const related = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        orderId: { in: orderIds },
        productId: { not: productId },
      },
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: limit,
    });

    const productIds = related.map((r) => r.productId);
    return this.prisma.product.findMany({
      where: { id: { in: productIds }, deletedAt: null },
      include: { images: { take: 1 } },
    });
  }

  /**
   * Product recommendations - user-based collaborative filtering placeholder
   */
  async getRecommendations(userId: string, limit = 8) {
    const userOrders = await this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
    });
    const purchasedIds = new Set(
      userOrders.flatMap((o) => o.items.map((i) => i.productId)),
    );

    return this.prisma.product.findMany({
      where: {
        id: { notIn: [...purchasedIds] },
        deletedAt: null,
        isActive: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { images: { take: 1 } },
    });
  }

  /**
   * AI product description generator - placeholder
   * In production: call OpenAI/Claude API
   */
  async generateDescription(name: string, category?: string): Promise<string> {
    return `${name} - Premium quality product${category ? ` in ${category} category` : ''}. Discover the perfect blend of style and functionality.`;
  }

  /**
   * Fraud detection - basic rule-based placeholder
   * Flags: high value, new user, rapid orders
   */
  async flagSuspiciousTransaction(
    userId: string,
    amount: number,
    orderId: string,
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) return true;

    const userOrderCount = await this.prisma.order.count({
      where: { userId },
    });

    const isNewUser = userOrderCount <= 1;
    const isHighValue = amount > 500;

    if (isNewUser && isHighValue) {
      await this.prisma.payment.updateMany({
        where: { orderId },
        data: { fraudFlagged: true },
      });
      return true;
    }
    return false;
  }
}
