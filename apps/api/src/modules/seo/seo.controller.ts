import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StoreContextGuard } from '../../common/guards/store-context.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { SeoService } from './seo.service';
import { UpdateSeoDto } from './dto/update-seo.dto';

@ApiTags('seo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StoreContextGuard)
@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Patch('products/:id')
  @ApiOperation({ summary: 'Update product SEO' })
  updateProduct(@CurrentStore() store: { id: string }, @Param('id') id: string, @Body() dto: UpdateSeoDto) {
    return this.seoService.updateProductSeo(store.id, id, dto);
  }

  @Patch('collections/:id')
  @ApiOperation({ summary: 'Update collection SEO' })
  updateCollection(@CurrentStore() store: { id: string }, @Param('id') id: string, @Body() dto: UpdateSeoDto) {
    return this.seoService.updateCollectionSeo(store.id, id, dto);
  }

  @Patch('pages/:id')
  @ApiOperation({ summary: 'Update page SEO' })
  updatePage(@CurrentStore() store: { id: string }, @Param('id') id: string, @Body() dto: UpdateSeoDto) {
    return this.seoService.updatePageSeo(store.id, id, dto);
  }

  @Patch('blogs/posts/:id')
  @ApiOperation({ summary: 'Update blog post SEO' })
  updateBlogPost(@CurrentStore() store: { id: string }, @Param('id') id: string, @Body() dto: UpdateSeoDto) {
    return this.seoService.updateBlogPostSeo(store.id, id, dto);
  }

  @Get('store')
  @ApiOperation({ summary: 'Get store SEO settings' })
  getStoreSeo(@CurrentStore() store: { id: string }) {
    return this.seoService.getStoreSeo(store.id);
  }

  @Patch('store')
  @ApiOperation({ summary: 'Update store SEO settings' })
  updateStoreSeo(@CurrentStore() store: { id: string }, @Body() dto: UpdateSeoDto) {
    return this.seoService.updateStoreSeo(store.id, dto);
  }
}
