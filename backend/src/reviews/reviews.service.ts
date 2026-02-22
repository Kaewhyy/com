import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, productId: string, rating: number, title?: string, content?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.prisma.review.findUnique({
      where: { productId_userId: { productId, userId } },
    });
    if (existing) throw new ConflictException('You have already reviewed this product');

    return this.prisma.review.create({
      data: { userId, productId, rating, title, content },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
  }

  async findByProduct(productId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true } } },
      }),
      this.prisma.review.count({ where: { productId } }),
    ]);

    const avg = await this.prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: true,
    });

    return {
      data: reviews,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      average: avg._avg.rating,
      count: avg._count,
    };
  }
}
