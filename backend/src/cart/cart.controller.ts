import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AddToCartDto } from './dto/add-to-cart.dto';

@ApiTags('cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  async getCart(@CurrentUser('sub') userId: string) {
    return this.cartService.getOrCreateCart(userId);
  }

  @Post('items')
  async addItem(
    @CurrentUser('sub') userId: string,
    @Body() dto: AddToCartDto,
  ) {
    return this.cartService.addItem(userId, dto);
  }

  @Patch('items/:itemId')
  async updateItem(
    @CurrentUser('sub') userId: string,
    @Param('itemId') itemId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.updateItem(userId, itemId, quantity);
  }

  @Delete('items/:itemId')
  async removeItem(
    @CurrentUser('sub') userId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeItem(userId, itemId);
  }

  @Post('coupon')
  async applyCoupon(
    @CurrentUser('sub') userId: string,
    @Body('code') code: string,
  ) {
    return this.cartService.applyCoupon(userId, code);
  }

  @Delete('coupon')
  async removeCoupon(@CurrentUser('sub') userId: string) {
    return this.cartService.removeCoupon(userId);
  }
}
