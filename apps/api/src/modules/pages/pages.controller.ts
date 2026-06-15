import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StoreContextGuard } from '../../common/guards/store-context.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@ApiTags('pages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StoreContextGuard)
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  @ApiOperation({ summary: 'List pages for store' })
  findAll(@CurrentStore() store: { id: string }) {
    return this.pagesService.findAll(store.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a page' })
  create(@CurrentStore() store: { id: string }, @Body() dto: CreatePageDto) {
    return this.pagesService.create(store.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a page' })
  findOne(@CurrentStore() store: { id: string }, @Param('id') id: string) {
    return this.pagesService.findOne(store.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a page' })
  update(@CurrentStore() store: { id: string }, @Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.pagesService.update(store.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a page' })
  remove(@CurrentStore() store: { id: string }, @Param('id') id: string) {
    return this.pagesService.remove(store.id, id);
  }

  @Public()
  @Get('public/:handle')
  @ApiOperation({ summary: 'Get published page by handle' })
  findByHandle(@Query('storeId') storeId: string, @Param('handle') handle: string) {
    return this.pagesService.findByHandle(storeId, handle);
  }
}
