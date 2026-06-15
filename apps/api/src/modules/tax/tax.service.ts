import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaxRateDto } from './dto/create-tax-rate.dto';
import { CalculateTaxDto } from './dto/calculate-tax.dto';

@Injectable()
export class TaxService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllRates(storeId: string) {
    return this.prisma.taxRate.findMany({
      where: { storeId },
      orderBy: [{ priority: 'asc' }],
    });
  }

  async createRate(storeId: string, dto: CreateTaxRateDto) {
    return this.prisma.taxRate.create({
      data: {
        storeId,
        name: dto.name,
        rate: dto.rate,
        country: dto.country,
        province: dto.province ?? null,
        isIncluded: dto.isIncluded ?? false,
        priority: dto.priority ?? 0,
      },
    });
  }

  async updateRate(storeId: string, id: string, dto: Partial<CreateTaxRateDto>) {
    await this.findRateOrFail(storeId, id);
    return this.prisma.taxRate.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.rate !== undefined && { rate: dto.rate }),
        ...(dto.country !== undefined && { country: dto.country }),
        ...(dto.province !== undefined && { province: dto.province }),
        ...(dto.isIncluded !== undefined && { isIncluded: dto.isIncluded }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
      },
    });
  }

  async removeRate(storeId: string, id: string) {
    await this.findRateOrFail(storeId, id);
    return this.prisma.taxRate.delete({ where: { id } });
  }

  async calculateTax(dto: CalculateTaxDto, storeId: string) {
    // Fetch all tax rates for this store and country, ordered by priority
    const allRates = await this.prisma.taxRate.findMany({
      where: { storeId, country: dto.countryCode },
      orderBy: { priority: 'asc' },
    });

    // If province is provided, prefer province-specific rates over country-wide rates.
    // Collect applicable rates: province-specific ones first, then country-wide (province IS NULL)
    // filtering out country-wide if a province-specific rate exists for the same name/priority.
    let applicableRates: typeof allRates;

    if (dto.province) {
      const provinceRates = allRates.filter((r) => r.province === dto.province);
      const countryRates = allRates.filter((r) => r.province === null);

      if (provinceRates.length > 0) {
        // Use province-specific rates only (they override country-wide)
        applicableRates = provinceRates;
      } else {
        // Fallback to country-wide (no province) rates
        applicableRates = countryRates;
      }
    } else {
      // No province specified — use only country-wide rates (province IS NULL)
      applicableRates = allRates.filter((r) => r.province === null);
    }

    const taxLines: Array<{ title: string; rate: number; price: number }> = [];

    for (const taxRate of applicableRates) {
      const rateValue = Number(taxRate.rate);
      let taxTotal = 0;

      for (const item of dto.lineItems) {
        if (!item.taxable) continue;
        taxTotal += item.price * item.quantity * rateValue;
      }

      if (taxTotal > 0) {
        taxLines.push({
          title: taxRate.name,
          rate: rateValue,
          price: Math.round(taxTotal * 100) / 100,
        });
      }
    }

    const totalTax = Math.round(taxLines.reduce((sum, t) => sum + t.price, 0) * 100) / 100;

    return { taxLines, totalTax };
  }

  private async findRateOrFail(storeId: string, id: string) {
    const rate = await this.prisma.taxRate.findFirst({ where: { id, storeId } });
    if (!rate) throw new NotFoundException('Tax rate not found');
    return rate;
  }
}
