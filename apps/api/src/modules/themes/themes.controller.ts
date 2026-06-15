import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StoreContextGuard } from '../../common/guards/store-context.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { ThemesService } from './themes.service';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@ApiTags('themes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StoreContextGuard)
@Controller('themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Get()
  @ApiOperation({ summary: 'List themes for store' })
  findAll(@CurrentStore() store: { id: string }) {
    return this.themesService.findAll(store.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a theme' })
  create(@CurrentStore() store: { id: string }, @Body() dto: CreateThemeDto) {
    return this.themesService.create(store.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a theme' })
  findOne(@CurrentStore() store: { id: string }, @Param('id') id: string) {
    return this.themesService.findOne(store.id, id);
  }

  @Patch(':id/settings')
  @ApiOperation({ summary: 'Update theme settings (JSON merge patch)' })
  updateSettings(
    @CurrentStore() store: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.themesService.updateSettings(store.id, id, dto);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish theme (set as MAIN)' })
  publish(@CurrentStore() store: { id: string }, @Param('id') id: string) {
    return this.themesService.publish(store.id, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a theme (cannot delete MAIN)' })
  remove(@CurrentStore() store: { id: string }, @Param('id') id: string) {
    return this.themesService.remove(store.id, id);
  }
}
