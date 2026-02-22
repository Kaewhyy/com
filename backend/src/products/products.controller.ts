import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List products with filters' })
  async findAll(
    @Query() pagination: PaginationDto,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.productsService.findAll({
      ...pagination,
      categoryId,
      search,
      minPrice,
      maxPrice,
      sortBy,
    });
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get product by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Public()
  @Get(':slug/related')
  @ApiOperation({ summary: 'Get related products' })
  async getRelated(
    @Param('slug') slug: string,
    @Query('limit') limit?: number,
  ) {
    const product = await this.productsService.findBySlug(slug);
    return this.productsService.getRelated(
      (product as { id: string }).id,
      (product as { categoryId: string }).categoryId,
      limit,
    );
  }
}
