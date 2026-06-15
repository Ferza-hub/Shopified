import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { CreateRateDto } from './dto/create-rate.dto';
import { UpdateRateDto } from './dto/update-rate.dto';
import { CalculateShippingDto } from './dto/calculate-shipping.dto';

@Injectable()
export class ShippingService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllZones(storeId: string) {
    return this.prisma.shippingZone.findMany({
      where: { storeId },
      include: { rates: true },
      orderBy: { name: 'asc' },
    });
  }

  async createZone(storeId: string, dto: CreateZoneDto) {
    return this.prisma.shippingZone.create({
      data: {
        storeId,
        name: dto.name,
        countries: dto.countries ?? [],
        provinces: dto.provinces ?? [],
      },
      include: { rates: true },
    });
  }

  async updateZone(storeId: string, id: string, dto: UpdateZoneDto) {
    const zone = await this.prisma.shippingZone.findFirst({
      where: { id, storeId },
    });

    if (!zone) {
      throw new NotFoundException(`Shipping zone ${id} not found`);
    }

    return this.prisma.shippingZone.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.countries !== undefined && { countries: dto.countries }),
        ...(dto.provinces !== undefined && { provinces: dto.provinces }),
      },
      include: { rates: true },
    });
  }

  async deleteZone(storeId: string, id: string) {
    const zone = await this.prisma.shippingZone.findFirst({
      where: { id, storeId },
    });

    if (!zone) {
      throw new NotFoundException(`Shipping zone ${id} not found`);
    }

    await this.prisma.shippingZone.delete({ where: { id } });
  }

  async addRate(storeId: string, zoneId: string, dto: CreateRateDto) {
    const zone = await this.prisma.shippingZone.findFirst({
      where: { id: zoneId, storeId },
    });

    if (!zone) {
      throw new NotFoundException(`Shipping zone ${zoneId} not found`);
    }

    return this.prisma.shippingRate.create({
      data: {
        shippingZoneId: zoneId,
        name: dto.name,
        price: dto.price,
        conditionType: dto.conditionType,
        minValue: dto.minValue,
        maxValue: dto.maxValue,
        carrier: dto.carrier,
        serviceCode: dto.serviceCode,
        estimatedDays: dto.estimatedDays,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateRate(storeId: string, zoneId: string, rateId: string, dto: UpdateRateDto) {
    // Verify zone belongs to store
    const zone = await this.prisma.shippingZone.findFirst({
      where: { id: zoneId, storeId },
    });

    if (!zone) {
      throw new NotFoundException(`Shipping zone ${zoneId} not found`);
    }

    const rate = await this.prisma.shippingRate.findFirst({
      where: { id: rateId, shippingZoneId: zoneId },
    });

    if (!rate) {
      throw new NotFoundException(`Shipping rate ${rateId} not found`);
    }

    return this.prisma.shippingRate.update({
      where: { id: rateId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.conditionType !== undefined && { conditionType: dto.conditionType }),
        ...(dto.minValue !== undefined && { minValue: dto.minValue }),
        ...(dto.maxValue !== undefined && { maxValue: dto.maxValue }),
        ...(dto.carrier !== undefined && { carrier: dto.carrier }),
        ...(dto.serviceCode !== undefined && { serviceCode: dto.serviceCode }),
        ...(dto.estimatedDays !== undefined && { estimatedDays: dto.estimatedDays }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async deleteRate(storeId: string, zoneId: string, rateId: string) {
    const zone = await this.prisma.shippingZone.findFirst({
      where: { id: zoneId, storeId },
    });

    if (!zone) {
      throw new NotFoundException(`Shipping zone ${zoneId} not found`);
    }

    const rate = await this.prisma.shippingRate.findFirst({
      where: { id: rateId, shippingZoneId: zoneId },
    });

    if (!rate) {
      throw new NotFoundException(`Shipping rate ${rateId} not found`);
    }

    await this.prisma.shippingRate.delete({ where: { id: rateId } });
  }

  async calculateRates(storeId: string, dto: CalculateShippingDto) {
    // Find shipping zones matching country OR empty country list (applies to all)
    const zones = await this.prisma.shippingZone.findMany({
      where: {
        storeId,
        OR: [
          { countries: { has: dto.countryCode } },
          { countries: { isEmpty: true } },
        ],
      },
      include: {
        rates: { where: { isActive: true } },
      },
    });

    const cartTotal = dto.cartTotal ?? 0;
    const totalWeight = dto.totalWeight ?? 0;

    const matchingRates = zones.flatMap((zone) =>
      zone.rates
        .filter((rate) => {
          if (!rate.conditionType) return true;

          const min = Number(rate.minValue ?? 0);
          const max = Number(rate.maxValue ?? Infinity);

          if (rate.conditionType === 'price') {
            return cartTotal >= min && cartTotal <= max;
          }

          if (rate.conditionType === 'weight') {
            return totalWeight >= min && totalWeight <= max;
          }

          return true;
        })
        .map((rate) => ({
          id: rate.id,
          name: rate.name,
          price: Number(rate.price),
          carrier: rate.carrier,
          serviceCode: rate.serviceCode,
          estimatedDays: rate.estimatedDays,
          zoneName: zone.name,
        })),
    );

    // Sort by price ascending
    return matchingRates.sort((a, b) => a.price - b.price);
  }
}
