import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
} from 'class-validator';

export class CreateVariantDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ description: 'Decimal price as string, e.g. "9.99"' })
  @IsString()
  price: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  compareAtPrice?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  costPerItem?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  weight?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  weightUnit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requiresShipping?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  taxable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  position?: number;

  @ApiPropertyOptional({
    description: 'Array of { name, value } option selections',
    type: 'array',
    items: { type: 'object' },
  })
  @IsOptional()
  selectedOptions?: { name: string; value: string }[];
}
