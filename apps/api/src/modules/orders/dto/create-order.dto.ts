import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderLineItemDto {
  @ApiProperty({ description: 'Product variant ID' })
  @IsString()
  variantId: string;

  @ApiProperty({ description: 'Quantity ordered' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateOrderDto {
  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ description: 'Customer email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Line items', type: [OrderLineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderLineItemDto)
  lineItems: OrderLineItemDto[];

  @ApiPropertyOptional({ description: 'Shipping address' })
  @IsOptional()
  @IsObject()
  shippingAddress?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Order note' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ description: 'Order tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Discount codes', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  discountCodes?: string[];
}
