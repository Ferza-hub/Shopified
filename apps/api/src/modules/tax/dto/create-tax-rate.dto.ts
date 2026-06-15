import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTaxRateDto {
  @ApiProperty({ description: 'Tax rate name (e.g. "GST", "VAT")' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Tax rate as a decimal (e.g. 0.1 for 10%)',
    example: 0.1,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  rate: number;

  @ApiProperty({ description: 'ISO 3166-1 alpha-2 country code', example: 'US' })
  @IsString()
  country: string;

  @ApiPropertyOptional({ description: 'Province or state code', example: 'CA' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({
    description: 'Whether the tax is included in the price',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isIncluded?: boolean;

  @ApiPropertyOptional({
    description: 'Priority for tax application (lower = applied first)',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  priority?: number;
}
