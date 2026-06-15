import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StoreContextGuard } from '../../common/guards/store-context.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { CreateListingDto } from './dto/create-listing.dto';

@ApiTags('channels')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StoreContextGuard)
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get()
  @ApiOperation({ summary: 'List channels' })
  findAll(@CurrentStore() store: { id: string }) {
    return this.channelsService.findAll(store.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Connect a channel' })
  create(@CurrentStore() store: { id: string }, @Body() dto: CreateChannelDto) {
    return this.channelsService.create(store.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get channel with listing count' })
  findOne(@CurrentStore() store: { id: string }, @Param('id') id: string) {
    return this.channelsService.findOne(store.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update channel settings' })
  update(@CurrentStore() store: { id: string }, @Param('id') id: string, @Body() dto: CreateChannelDto) {
    return this.channelsService.update(store.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Disconnect a channel' })
  remove(@CurrentStore() store: { id: string }, @Param('id') id: string) {
    return this.channelsService.remove(store.id, id);
  }

  @Get(':id/listings')
  @ApiOperation({ summary: 'Get channel product listings' })
  findListings(@CurrentStore() store: { id: string }, @Param('id') id: string) {
    return this.channelsService.findListings(store.id, id);
  }

  @Post(':id/sync')
  @ApiOperation({ summary: 'Trigger channel sync' })
  sync(@CurrentStore() store: { id: string }, @Param('id') id: string) {
    return this.channelsService.sync(store.id, id);
  }

  @Post(':id/listings')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add product to channel listing' })
  createListing(
    @CurrentStore() store: { id: string },
    @Param('id') id: string,
    @Body() dto: CreateListingDto,
  ) {
    return this.channelsService.createListing(store.id, id, dto);
  }

  @Patch(':id/listings/:listingId')
  @ApiOperation({ summary: 'Update listing price/isActive' })
  updateListing(
    @CurrentStore() store: { id: string },
    @Param('id') id: string,
    @Param('listingId') listingId: string,
    @Body() dto: CreateListingDto,
  ) {
    return this.channelsService.updateListing(store.id, id, listingId, dto);
  }
}
