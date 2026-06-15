import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CompleteCheckoutDto {
  @ApiProperty({ description: 'Payment method', example: 'stripe' })
  @IsString()
  paymentMethod: string;

  @ApiProperty({ description: 'Shipping address' })
  @IsObject()
  shippingAddress: Record<string, any>;

  @ApiProperty({ description: 'Customer email' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Order note' })
  @IsOptional()
  @IsString()
  note?: string;
}
