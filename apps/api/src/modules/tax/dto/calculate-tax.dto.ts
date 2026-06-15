import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TaxLineItemDto {
  @ApiProperty({ description: 'Unit price of the item', example: 29.99 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({ description: 'Quantity of the item', example: 2 })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ description: 'Whether the item is taxable' })
  @IsBoolean()
  taxable: boolean;
}

export class CalculateTaxDto {
  @ApiProperty({ description: 'ISO 3166-1 alpha-2 country code', example: 'US' })
  @IsString()
  countryCode: string;

  @ApiPropertyOptional({ description: 'Province or state code', example: 'CA' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiProperty({ type: [TaxLineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxLineItemDto)
  lineItems: TaxLineItemDto[];
}
