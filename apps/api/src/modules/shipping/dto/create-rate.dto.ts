import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRateDto {
  @ApiProperty({ description: 'Rate name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Shipping price', minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Condition type: "price" or "weight"' })
  @IsOptional()
  @IsString()
  conditionType?: string;

  @ApiPropertyOptional({ description: 'Minimum condition value' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minValue?: number;

  @ApiPropertyOptional({ description: 'Maximum condition value (null for no limit)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxValue?: number;

  @ApiPropertyOptional({ description: 'Carrier name (e.g. FedEx, UPS)' })
  @IsOptional()
  @IsString()
  carrier?: string;

  @ApiPropertyOptional({ description: 'Carrier service code' })
  @IsOptional()
  @IsString()
  serviceCode?: string;

  @ApiPropertyOptional({ description: 'Estimated delivery days' })
  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedDays?: number;

  @ApiPropertyOptional({ description: 'Whether this rate is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
