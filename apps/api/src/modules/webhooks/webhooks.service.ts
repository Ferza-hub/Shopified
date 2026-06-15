import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import * as https from 'https';
import * as http from 'http';
import * as crypto from 'crypto';
import * as url from 'url';

@Injectable()
export class WebhooksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(storeId: string) {
    return this.prisma.webhook.findMany({ where: { storeId }, orderBy: { createdAt: 'desc' } });
  }

  async create(storeId: string, dto: CreateWebhookDto) {
    return this.prisma.webhook.create({
      data: {
        storeId,
        address: dto.address,
        topic: dto.topic,
        secret: dto.secret,
        format: dto.format ?? 'json',
      },
    });
  }

  async findOne(storeId: string, id: string) {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id, storeId },
      include: {
        deliveries: { orderBy: { sentAt: 'desc' }, take: 10 },
      },
    });
    if (!webhook) throw new NotFoundException('Webhook not found');
    return webhook;
  }

  async update(storeId: string, id: string, dto: Partial<CreateWebhookDto>) {
    await this.findOneRaw(storeId, id);
    return this.prisma.webhook.update({
      where: { id },
      data: {
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.topic !== undefined && { topic: dto.topic }),
      },
    });
  }

  async remove(storeId: string, id: string) {
    await this.findOneRaw(storeId, id);
    return this.prisma.webhook.delete({ where: { id } });
  }

  async sendTest(storeId: string, id: string) {
    const webhook = await this.findOneRaw(storeId, id);
    const payload = { test: true, topic: webhook.topic, timestamp: new Date().toISOString() };
    await this.deliver(id, webhook.topic, payload);
    return { status: 'sent' };
  }

  async deliver(webhookId: string, topic: string, payload: Record<string, any>): Promise<void> {
    const webhook = await this.prisma.webhook.findUnique({ where: { id: webhookId } });
    if (!webhook) return;

    const body = JSON.stringify(payload);
    const start = Date.now();
    let statusCode: number | undefined;
    let responseBody: string | undefined;
    let success = false;

    try {
      const parsedUrl = new url.URL(webhook.address);
      const isHttps = parsedUrl.protocol === 'https:';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Topic': topic,
        'Content-Length': Buffer.byteLength(body).toString(),
      };

      if (webhook.secret) {
        const sig = crypto.createHmac('sha256', webhook.secret).update(body).digest('hex');
        headers['X-Webhook-Signature'] = sig;
      }

      statusCode = await new Promise<number>((resolve, reject) => {
        const options = {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || (isHttps ? 443 : 80),
          path: parsedUrl.pathname + parsedUrl.search,
          method: 'POST',
          headers,
        };
        const req = (isHttps ? https : http).request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => { responseBody = data; resolve(res.statusCode ?? 0); });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
      });

      success = statusCode >= 200 && statusCode < 300;
    } catch (err) {
      responseBody = err instanceof Error ? err.message : String(err);
    }

    const duration = Date.now() - start;
    await this.prisma.webhookDelivery.create({
      data: {
        webhookId,
        topic,
        statusCode,
        duration,
        requestBody: payload,
        responseBody,
        success,
      },
    });
  }

  async deliverToAll(storeId: string, topic: string, payload: Record<string, any>): Promise<void> {
    const webhooks = await this.prisma.webhook.findMany({
      where: { storeId, topic, isActive: true },
    });
    await Promise.all(
      webhooks.map((w) => this.deliver(w.id, topic, payload).catch(() => {})),
    );
  }

  private async findOneRaw(storeId: string, id: string) {
    const webhook = await this.prisma.webhook.findFirst({ where: { id, storeId } });
    if (!webhook) throw new NotFoundException('Webhook not found');
    return webhook;
  }
}
