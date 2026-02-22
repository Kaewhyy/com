import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Prisma } from '@prisma/client';
import { getPaginationParams } from '../common/dto/pagination.dto';

const CACHE_TTL = 3600; // 1 hour
const PRODUCTS_CACHE_PREFIX = 'products:';
const PRODUCT_CACHE_PREFIX = 'product:';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  }) {
    const { page = 1, limit = 20, categoryId, search, minPrice, maxPrice, sortBy } = params;
    const { skip, take } = getPaginationParams(page, limit);

    const cacheKey = `${PRODUCTS_CACHE_PREFIX}${page}:${limit}:${categoryId || ''}:${search || ''}:${minPrice || ''}:${maxPrice || ''}:${sortBy || ''}`;
    const cached = await this.redis.getJson<{ data: unknown[]; total: number }>(cacheKey);
    if (cached) return cached;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      isActive: true,
    };

    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (minPrice != null || maxPrice != null) {
      where.price = {};
      if (minPrice != null) (where.price as Prisma.DecimalFilter).gte = minPrice;
      if (maxPrice != null) (where.price as Prisma.DecimalFilter).lte = maxPrice;
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = sortBy === 'price_asc'
      ? { price: 'asc' }
      : sortBy === 'price_desc'
        ? { price: 'desc' }
        : sortBy === 'newest'
          ? { createdAt: 'desc' }
          : { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
          category: { select: { name: true, slug: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const result = {
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    await this.redis.setJson(cacheKey, result, CACHE_TTL);
    return result;
  }

  async findBySlug(slug: string) {
    const cacheKey = `${PRODUCT_CACHE_PREFIX}${slug}`;
    const cached = await this.redis.getJson<unknown>(cacheKey);
    if (cached) return cached;

    const product = await this.prisma.product.findFirst({
      where: { slug, deletedAt: null, isActive: true },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        category: true,
        reviews: {
          include: { user: { select: { firstName: true, lastName: true } } },
          take: 10,
        },
      },
    });

    if (!product) throw new NotFoundException('Product not found');

    await this.redis.setJson(cacheKey, product, CACHE_TTL);
    return product;
  }

  async getRelated(productId: string, categoryId: string, limit = 4) {
    return this.prisma.product.findMany({
      where: {
        categoryId,
        id: { not: productId },
        deletedAt: null,
        isActive: true,
      },
      take: limit,
      include: { images: { take: 1 } },
    });
  }

  async invalidateCache(slug?: string) {
    if (slug) {
      await this.redis.del(`${PRODUCT_CACHE_PREFIX}${slug}`);
    }
    // In production, use Redis SCAN to clear products:* keys
  }
}
