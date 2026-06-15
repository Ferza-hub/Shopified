import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StoreContextGuard } from '../../common/guards/store-context.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@ApiTags('blogs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StoreContextGuard)
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  @ApiOperation({ summary: 'List blogs' })
  findAll(@CurrentStore() store: { id: string }) {
    return this.blogsService.findAllBlogs(store.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a blog' })
  create(@CurrentStore() store: { id: string }, @Body() dto: CreateBlogDto) {
    return this.blogsService.createBlog(store.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a blog' })
  update(@CurrentStore() store: { id: string }, @Param('id') id: string, @Body() dto: CreateBlogDto) {
    return this.blogsService.updateBlog(store.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a blog' })
  remove(@CurrentStore() store: { id: string }, @Param('id') id: string) {
    return this.blogsService.removeBlog(store.id, id);
  }

  @Get(':id/posts')
  @ApiOperation({ summary: 'List posts for a blog' })
  findPosts(
    @CurrentStore() store: { id: string },
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.blogsService.findPosts(store.id, id, +page, +limit);
  }

  @Post(':id/posts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a post' })
  createPost(@CurrentStore() store: { id: string }, @Param('id') id: string, @Body() dto: CreatePostDto) {
    return this.blogsService.createPost(store.id, id, dto);
  }

  @Get(':blogId/posts/:postId')
  @ApiOperation({ summary: 'Get a post' })
  findPost(@CurrentStore() store: { id: string }, @Param('blogId') blogId: string, @Param('postId') postId: string) {
    return this.blogsService.findPost(store.id, blogId, postId);
  }

  @Patch(':blogId/posts/:postId')
  @ApiOperation({ summary: 'Update a post' })
  updatePost(
    @CurrentStore() store: { id: string },
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.blogsService.updatePost(store.id, blogId, postId, dto);
  }

  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a post' })
  removePost(
    @CurrentStore() store: { id: string },
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
  ) {
    return this.blogsService.removePost(store.id, blogId, postId);
  }

  @Public()
  @Get('public')
  @ApiOperation({ summary: 'List public blogs' })
  findPublicBlogs(@Query('storeId') storeId: string) {
    return this.blogsService.findPublicBlogs(storeId);
  }

  @Public()
  @Get('public/:blogHandle')
  @ApiOperation({ summary: 'Get a published blog' })
  findPublicBlog(@Query('storeId') storeId: string, @Param('blogHandle') blogHandle: string) {
    return this.blogsService.findPublicBlog(storeId, blogHandle);
  }

  @Public()
  @Get('public/:blogHandle/posts/:postHandle')
  @ApiOperation({ summary: 'Get a published post' })
  findPublicPost(
    @Query('storeId') storeId: string,
    @Param('blogHandle') blogHandle: string,
    @Param('postHandle') postHandle: string,
  ) {
    return this.blogsService.findPublicPost(storeId, blogHandle, postHandle);
  }
}
