import { Controller, Get, Post, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('wishlist')
@ApiBearerAuth()
@Controller('wishlist')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  async findAll(@CurrentUser('sub') userId: string) {
    return this.wishlistService.findAll(userId);
  }

  @Post(':productId')
  async add(
    @CurrentUser('sub') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.add(userId, productId);
  }

  @Delete(':productId')
  async remove(
    @CurrentUser('sub') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.remove(userId, productId);
  }
}
