import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { getPaginationParams } from '../common/dto/pagination.dto';

function toNum(v: unknown): number {
  if (typeof v === 'number') return v;
  if (v && typeof v === 'object' && 'toNumber' in v) return (v as { toNumber: () => number }).toNumber();
  return Number(v) || 0;
}

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, addressId: string, couponCode?: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } }, coupon: true },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    let subtotal = 0;
    const orderItems = cart.items.map((item) => {
      const price = toNum(item.product.price);
      const total = price * item.quantity;
      subtotal += total;
      return {
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product.name,
        sku: item.product.sku,
        price,
        quantity: item.quantity,
        total,
        options: null,
      };
    });

    let discount = 0;
    let couponId = cart.couponId;
    if (cart.coupon) {
      if (cart.coupon.type === 'PERCENTAGE') {
        discount = subtotal * (toNum(cart.coupon.value) / 100);
      } else {
        discount = toNum(cart.coupon.value);
      }
      const maxDiscount = cart.coupon.maxDiscount ? toNum(cart.coupon.maxDiscount) : Infinity;
      discount = Math.min(discount, maxDiscount);
    }

    const total = subtotal - discount;
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const order = await this.prisma.$transaction(async (tx) => {
      const o = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId,
          couponId,
          subtotal,
          discount,
          total,
          items: { create: orderItems },
        },
        include: { items: true, address: true },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return o;
    });

    return order;
  }

  async findUserOrders(userId: string, page = 1, limit = 20) {
    const { skip, take } = getPaginationParams(page, limit);
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId, deletedAt: null },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      this.prisma.order.count({ where: { userId, deletedAt: null } }),
    ]);

    return {
      data: orders,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId, deletedAt: null },
      include: { items: { include: { product: true } }, address: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(orderId: string, status: OrderStatus, trackingNumber?: string) {
    const data: { status: OrderStatus; trackingNumber?: string; shippedAt?: Date; deliveredAt?: Date } = { status };
    if (trackingNumber) data.trackingNumber = trackingNumber;
    if (status === OrderStatus.SHIPPED) data.shippedAt = new Date();
    if (status === OrderStatus.DELIVERED) data.deliveredAt = new Date();

    return this.prisma.order.update({
      where: { id: orderId },
      data,
    });
  }
}
