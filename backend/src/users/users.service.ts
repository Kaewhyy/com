import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isVerified: true,
        addresses: { where: { deletedAt: null } },
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, data: Prisma.UserUpdateInput & { password?: string }) {
    const updateData = { ...data };
    if (updateData.password) {
      (updateData as Prisma.UserUpdateInput).passwordHash = await bcrypt.hash(
        updateData.password,
        12,
      );
      delete updateData.password;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData as Prisma.UserUpdateInput,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        updatedAt: true,
      },
    });
  }
}
