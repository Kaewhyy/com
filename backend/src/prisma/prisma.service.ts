import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Soft delete helper - use for models with deletedAt
   */
  async softDelete(model: string, id: string) {
    const delegate = (this as Record<string, unknown>)[model] as {
      update: (args: unknown) => Promise<unknown>;
    };
    if (delegate?.update) {
      return delegate.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    }
    throw new Error(`Model ${model} not found`);
  }
}
