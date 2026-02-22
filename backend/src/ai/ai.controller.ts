import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Public()
  @Get('products/:productId/frequently-bought-together')
  async getFrequentlyBoughtTogether(
    @Param('productId') productId: string,
    @Query('limit') limit?: number,
  ) {
    return this.aiService.getFrequentlyBoughtTogether(productId, limit);
  }

  @Get('recommendations')
  @ApiBearerAuth()
  async getRecommendations(
    @CurrentUser('sub') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.aiService.getRecommendations(userId, limit);
  }

  @Post('generate-description')
  @ApiBearerAuth()
  async generateDescription(
    @Body('name') name: string,
    @Body('category') category?: string,
  ) {
    return this.aiService.generateDescription(name, category);
  }
}
