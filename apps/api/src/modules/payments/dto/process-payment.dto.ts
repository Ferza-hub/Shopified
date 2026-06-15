import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ProcessPaymentDto {
  @ApiProperty({ description: 'Order ID to process payment for' })
  @IsString()
  orderId: string;

  @ApiProperty({ description: 'Payment gateway', example: 'stripe' })
  @IsString()
  gateway: string;

  @ApiPropertyOptional({ description: 'Payment method (e.g. card, bank_transfer)' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiProperty({ description: 'Amount to charge' })
  @IsNumber()
  @Min(0)
  amount: number;
}
