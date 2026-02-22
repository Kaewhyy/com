import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('cms')
@Controller('cms')
export class CmsController {
  constructor(private cmsService: CmsService) {}

  @Public()
  @Get('pages/:slug')
  async getPage(@Param('slug') slug: string) {
    return this.cmsService.getPage(slug);
  }

  @Public()
  @Get('banners')
  async getBanners(@Query('position') position?: string) {
    return this.cmsService.getBanners(position);
  }
}
