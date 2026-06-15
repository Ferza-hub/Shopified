import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class AddItemDto {
  @ApiProperty({ description: 'Product variant ID' })
  @IsString()
  variantId: string;

  @ApiProperty({ description: 'Quantity to add', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Custom properties (key-value pairs)' })
  @IsOptional()
  @IsObject()
  properties?: Record<string, any>;
}
