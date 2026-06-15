import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ValidateDiscountDto {
  @ApiProperty({ description: 'Discount code to validate' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Cart total for minimum purchase validation' })
  @IsNumber()
  @Min(0)
  cartTotal: number;

  @ApiPropertyOptional({ description: 'Customer ID for per-customer usage limit check' })
  @IsOptional()
  @IsString()
  customerId?: string;
}
