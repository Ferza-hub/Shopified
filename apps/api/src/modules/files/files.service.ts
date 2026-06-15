import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  async upload(storeId: string, file: Express.Multer.File) {
    const uuid = uuidv4();
    const filename = `${uuid}-${file.originalname}`;
    const dir = `/tmp/uploads/${storeId}`;
    const filePath = path.join(dir, filename);

    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, file.buffer);

    const url = `/uploads/${storeId}/${filename}`;
    const record = await this.prisma.file.create({
      data: {
        storeId,
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url,
      },
    });
    return { id: record.id, url, filename: file.originalname, mimeType: file.mimetype, size: file.size };
  }

  async findAll(storeId: string) {
    return this.prisma.file.findMany({ where: { storeId }, orderBy: { createdAt: 'desc' } });
  }

  async delete(storeId: string, id: string) {
    const file = await this.prisma.file.findFirst({ where: { id, storeId } });
    if (!file) throw new NotFoundException('File not found');
    const filePath = `/tmp${file.url}`;
    try { fs.unlinkSync(filePath); } catch { /* ignore if not on disk */ }
    return this.prisma.file.delete({ where: { id } });
  }
}
