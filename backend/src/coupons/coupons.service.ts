import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async validate(code: string, orderAmount: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        expiresAt: { gt: new Date() },
        startsAt: { lt: new Date() },
      },
    });

    if (!coupon) return null;
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return null;
    if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) return null;

    return coupon;
  }
}
