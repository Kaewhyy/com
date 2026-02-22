import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CouponsService } from '../coupons/coupons.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private couponsService: CouponsService,
  ) {}

  async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: { take: 1 } },
            },
          },
        },
        coupon: true,
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: { images: { take: 1 } },
              },
            },
          },
          coupon: true,
        },
      });
    }

    return this.calculateTotals(cart);
  }

  async addItem(userId: string, dto: AddToCartDto) {
    const cart = await this.getOrCreateCart(userId);
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const variantId = dto.variantId || '';
    await this.prisma.cartItem.upsert({
      where: {
        cartId_productId_variantId: {
          cartId: (cart as { id: string }).id,
          productId: dto.productId,
          variantId,
        },
      },
      create: {
        cartId: (cart as { id: string }).id,
        productId: dto.productId,
        variantId: dto.variantId || '',
        quantity: dto.quantity || 1,
      },
      update: {
        quantity: { increment: dto.quantity || 1 },
      },
    });

    return this.getOrCreateCart(userId);
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');

    if (quantity <= 0) {
      await this.prisma.cartItem.deleteMany({
        where: { id: itemId, cartId: cart.id },
      });
    } else {
      await this.prisma.cartItem.updateMany({
        where: { id: itemId, cartId: cart.id },
        data: { quantity },
      });
    }

    return this.getOrCreateCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');

    await this.prisma.cartItem.deleteMany({
      where: { id: itemId, cartId: cart.id },
    });

    return this.getOrCreateCart(userId);
  }

  async applyCoupon(userId: string, code: string) {
    const cart = await this.getOrCreateCart(userId);
    const coupon = await this.couponsService.validate(code, (cart as { subtotal: number }).subtotal);
    if (!coupon) throw new NotFoundException('Invalid coupon');

    await this.prisma.cart.update({
      where: { userId },
      data: { couponId: coupon.id },
    });

    return this.getOrCreateCart(userId);
  }

  async removeCoupon(userId: string) {
    await this.prisma.cart.update({
      where: { userId },
      data: { couponId: null },
    });
    return this.getOrCreateCart(userId);
  }

  private async calculateTotals(cart: unknown) {
    const c = cart as {
      id: string;
      items: { quantity: number; product: { price: { toNumber: () => number } }; variantId?: string }[];
      coupon?: { type: string; value: { toNumber: () => number }; maxDiscount?: { toNumber: () => number } };
    };
    let subtotal = 0;
    for (const item of c.items) {
      subtotal += item.quantity * item.product.price.toNumber?.() ?? Number(item.product.price);
    }
    let discount = 0;
    if (c.coupon) {
      if (c.coupon.type === 'PERCENTAGE') {
        discount = subtotal * (c.coupon.value.toNumber?.() ?? Number(c.coupon.value)) / 100;
      } else {
        discount = c.coupon.value.toNumber?.() ?? Number(c.coupon.value);
      }
      if (c.coupon.maxDiscount) {
        discount = Math.min(discount, c.coupon.maxDiscount.toNumber?.() ?? Number(c.coupon.maxDiscount));
      }
    }
    return { ...c, subtotal, discount, total: subtotal - discount };
  }
}
