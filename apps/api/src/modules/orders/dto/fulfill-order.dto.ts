import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class FulfillmentLineItemDto {
  @ApiProperty({ description: 'Order line item ID' })
  @IsString()
  lineItemId: string;

  @ApiProperty({ description: 'Quantity to fulfill' })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class FulfillOrderDto {
  @ApiProperty({ description: 'Line items to fulfill', type: [FulfillmentLineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FulfillmentLineItemDto)
  lineItems: FulfillmentLineItemDto[];

  @ApiPropertyOptional({ description: 'Tracking number' })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({ description: 'Tracking company/carrier' })
  @IsOptional()
  @IsString()
  trackingCompany?: string;

  @ApiPropertyOptional({ description: 'Tracking URL' })
  @IsOptional()
  @IsString()
  trackingUrl?: string;
}
