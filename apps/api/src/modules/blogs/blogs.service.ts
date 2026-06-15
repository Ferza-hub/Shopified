import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

@Injectable()
export class BlogsService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateBlogHandle(storeId: string, base: string, excludeId?: string): Promise<string> {
    let handle = slugify(base);
    let suffix = 0;
    while (true) {
      const candidate = suffix === 0 ? handle : `${handle}-${suffix}`;
      const existing = await this.prisma.blog.findFirst({
        where: { storeId, handle: candidate, ...(excludeId && { NOT: { id: excludeId } }) },
      });
      if (!existing) return candidate;
      suffix++;
    }
  }

  private async generatePostHandle(blogId: string, base: string, excludeId?: string): Promise<string> {
    let handle = slugify(base);
    let suffix = 0;
    while (true) {
      const candidate = suffix === 0 ? handle : `${handle}-${suffix}`;
      const existing = await this.prisma.blogPost.findFirst({
        where: { blogId, handle: candidate, ...(excludeId && { NOT: { id: excludeId } }) },
      });
      if (!existing) return candidate;
      suffix++;
    }
  }

  async findAllBlogs(storeId: string) {
    return this.prisma.blog.findMany({ where: { storeId }, orderBy: { createdAt: 'desc' } });
  }

  async createBlog(storeId: string, dto: CreateBlogDto) {
    const handle = await this.generateBlogHandle(storeId, dto.handle || dto.title);
    return this.prisma.blog.create({
      data: { storeId, title: dto.title, handle, commentable: dto.commentable ?? false, seoTitle: dto.seoTitle, seoDescription: dto.seoDescription },
    });
  }

  async updateBlog(storeId: string, id: string, dto: Partial<CreateBlogDto>) {
    const blog = await this.prisma.blog.findFirst({ where: { id, storeId } });
    if (!blog) throw new NotFoundException('Blog not found');
    const handle = dto.handle || dto.title
      ? await this.generateBlogHandle(storeId, dto.handle || dto.title!, id)
      : undefined;
    return this.prisma.blog.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(handle && { handle }),
        ...(dto.commentable !== undefined && { commentable: dto.commentable }),
        ...(dto.seoTitle !== undefined && { seoTitle: dto.seoTitle }),
        ...(dto.seoDescription !== undefined && { seoDescription: dto.seoDescription }),
      },
    });
  }

  async removeBlog(storeId: string, id: string) {
    const blog = await this.prisma.blog.findFirst({ where: { id, storeId } });
    if (!blog) throw new NotFoundException('Blog not found');
    return this.prisma.blog.delete({ where: { id } });
  }

  async findPosts(storeId: string, blogId: string, page = 1, limit = 20) {
    const blog = await this.prisma.blog.findFirst({ where: { id: blogId, storeId } });
    if (!blog) throw new NotFoundException('Blog not found');
    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({ where: { blogId }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      this.prisma.blogPost.count({ where: { blogId } }),
    ]);
    return { posts, total, page, limit };
  }

  async createPost(storeId: string, blogId: string, dto: CreatePostDto) {
    const blog = await this.prisma.blog.findFirst({ where: { id: blogId, storeId } });
    if (!blog) throw new NotFoundException('Blog not found');
    const handle = await this.generatePostHandle(blogId, dto.handle || dto.title);
    return this.prisma.blogPost.create({
      data: {
        blogId,
        title: dto.title,
        handle,
        body: dto.body,
        bodyHtml: dto.bodyHtml,
        author: dto.author,
        excerpt: dto.excerpt,
        image: dto.image,
        tags: dto.tags ?? [],
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
      },
    });
  }

  async findPost(storeId: string, blogId: string, postId: string) {
    const blog = await this.prisma.blog.findFirst({ where: { id: blogId, storeId } });
    if (!blog) throw new NotFoundException('Blog not found');
    const post = await this.prisma.blogPost.findFirst({ where: { id: postId, blogId } });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async updatePost(storeId: string, blogId: string, postId: string, dto: UpdatePostDto) {
    const post = await this.findPost(storeId, blogId, postId);
    const handle = dto.handle || dto.title
      ? await this.generatePostHandle(blogId, dto.handle || dto.title!, postId)
      : undefined;
    return this.prisma.blogPost.update({
      where: { id: post.id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(handle && { handle }),
        ...(dto.body !== undefined && { body: dto.body }),
        ...(dto.bodyHtml !== undefined && { bodyHtml: dto.bodyHtml }),
        ...(dto.author !== undefined && { author: dto.author }),
        ...(dto.excerpt !== undefined && { excerpt: dto.excerpt }),
        ...(dto.image !== undefined && { image: dto.image }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
        ...(dto.publishedAt !== undefined && { publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null }),
        ...(dto.seoTitle !== undefined && { seoTitle: dto.seoTitle }),
        ...(dto.seoDescription !== undefined && { seoDescription: dto.seoDescription }),
      },
    });
  }

  async removePost(storeId: string, blogId: string, postId: string) {
    const post = await this.findPost(storeId, blogId, postId);
    return this.prisma.blogPost.delete({ where: { id: post.id } });
  }

  async findPublicBlogs(storeId: string) {
    return this.prisma.blog.findMany({
      where: { storeId },
      include: {
        _count: { select: { posts: { where: { NOT: { publishedAt: null } } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPublicBlog(storeId: string, handle: string) {
    const blog = await this.prisma.blog.findFirst({ where: { storeId, handle } });
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  async findPublicPost(storeId: string, blogHandle: string, postHandle: string) {
    const blog = await this.prisma.blog.findFirst({ where: { storeId, handle: blogHandle } });
    if (!blog) throw new NotFoundException('Blog not found');
    const post = await this.prisma.blogPost.findFirst({
      where: { blogId: blog.id, handle: postHandle, NOT: { publishedAt: null } },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }
}
