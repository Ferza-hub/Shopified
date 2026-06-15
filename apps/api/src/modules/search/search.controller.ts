import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { SearchService } from './search.service';

@ApiTags('search')
@Public()
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search products, collections, and pages' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'storeId', required: true })
  @ApiQuery({ name: 'type', required: false, description: 'Comma-separated types: products,collections,pages' })
  search(
    @Query('storeId') storeId: string,
    @Query('q') q: string,
    @Query('type') type?: string,
  ) {
    const types = type ? type.split(',').map((t) => t.trim()) : [];
    return this.searchService.search(storeId, q, types);
  }
}
