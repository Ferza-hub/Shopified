import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { DiscountType, DiscountValueType } from '@prisma/client';

export class CreateDiscountDto {
  @ApiProperty({ description: 'Discount title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Discount code (required if type=CODE)' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ enum: DiscountType, description: 'Discount type' })
  @IsEnum(DiscountType)
  type: DiscountType;

  @ApiProperty({ enum: DiscountValueType, description: 'Value type' })
  @IsEnum(DiscountValueType)
  valueType: DiscountValueType;

  @ApiProperty({ description: 'Discount value (percentage or fixed amount)' })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ description: 'Minimum purchase amount to qualify' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumPurchaseAmount?: number;

  @ApiPropertyOptional({ description: 'Total usage limit' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  usageLimit?: number;

  @ApiPropertyOptional({ description: 'Per customer usage limit' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  perCustomerUsageLimit?: number;

  @ApiProperty({ description: 'When the discount becomes active' })
  @IsDateString()
  startsAt: Date;

  @ApiPropertyOptional({ description: 'When the discount expires' })
  @IsOptional()
  @IsDateString()
  endsAt?: Date;

  @ApiPropertyOptional({ description: 'Whether the discount is enabled' })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
