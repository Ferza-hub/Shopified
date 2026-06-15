import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StoreContextGuard } from '../../common/guards/store-context.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';

@ApiTags('reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StoreContextGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'List reviews for store' })
  findAll(@CurrentStore() store: { id: string }, @Query() query: ReviewQueryDto) {
    return this.reviewsService.findAll(store.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a review' })
  findOne(@CurrentStore() store: { id: string }, @Param('id') id: string) {
    return this.reviewsService.findOne(store.id, id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a review' })
  approve(@CurrentStore() store: { id: string }, @Param('id') id: string) {
    return this.reviewsService.approve(store.id, id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a review' })
  reject(@CurrentStore() store: { id: string }, @Param('id') id: string) {
    return this.reviewsService.reject(store.id, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a review' })
  remove(@CurrentStore() store: { id: string }, @Param('id') id: string) {
    return this.reviewsService.remove(store.id, id);
  }

  @Public()
  @Post('public')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a public review' })
  submitPublic(@Body() dto: CreateReviewDto) {
    return this.reviewsService.submitPublic(dto);
  }

  @Public()
  @Get('public/product/:productId')
  @ApiOperation({ summary: 'Get approved reviews for a product' })
  getPublicProductReviews(@Param('productId') productId: string) {
    return this.reviewsService.getPublicProductReviews(productId);
  }
}
