import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CalculateShippingDto {
  @ApiProperty({ description: 'ISO 3166-1 alpha-2 country code' })
  @IsString()
  countryCode: string;

  @ApiPropertyOptional({ description: 'Province/state code' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ description: 'Cart total for price-based conditions' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cartTotal?: number;

  @ApiPropertyOptional({ description: 'Total order weight for weight-based conditions' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalWeight?: number;
}
