import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CmsService {
  constructor(private prisma: PrismaService) {}

  async getPage(slug: string) {
    const page = await this.prisma.cmsPage.findFirst({
      where: { slug, isActive: true },
    });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async getBanners(position?: string) {
    const now = new Date();
    return this.prisma.banner.findMany({
      where: {
        isActive: true,
        ...(position && { position }),
        OR: [
          { startsAt: null, expiresAt: null },
          { startsAt: { lte: now }, expiresAt: { gte: now } },
          { startsAt: { lte: now }, expiresAt: null },
          { startsAt: null, expiresAt: { gte: now } },
        ],
      },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
