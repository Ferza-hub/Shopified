import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StoreContextGuard } from '../../common/guards/store-context.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { TaxService } from './tax.service';
import { CreateTaxRateDto } from './dto/create-tax-rate.dto';
import { CalculateTaxDto } from './dto/calculate-tax.dto';

@ApiTags('tax')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StoreContextGuard)
@Controller('tax')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Get('rates')
  findAllRates(@CurrentStore() store: { id: string }) {
    return this.taxService.findAllRates(store.id);
  }

  @Post('rates')
  @HttpCode(201)
  createRate(@CurrentStore() store: { id: string }, @Body() dto: CreateTaxRateDto) {
    return this.taxService.createRate(store.id, dto);
  }

  @Patch('rates/:id')
  updateRate(
    @CurrentStore() store: { id: string },
    @Param('id') id: string,
    @Body() dto: Partial<CreateTaxRateDto>,
  ) {
    return this.taxService.updateRate(store.id, id, dto);
  }

  @Delete('rates/:id')
  @HttpCode(204)
  removeRate(@CurrentStore() store: { id: string }, @Param('id') id: string) {
    return this.taxService.removeRate(store.id, id);
  }

  @Post('calculate')
  calculateTax(@Body() dto: CalculateTaxDto, @CurrentStore() store: { id: string }) {
    return this.taxService.calculateTax(dto, store.id);
  }
}
