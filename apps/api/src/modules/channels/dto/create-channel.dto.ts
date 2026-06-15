import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsObject } from 'class-validator';

export enum ChannelPlatform {
  SHOPEE = 'SHOPEE',
  TOKOPEDIA = 'TOKOPEDIA',
  LAZADA = 'LAZADA',
  TIKTOK_SHOP = 'TIKTOK_SHOP',
  AMAZON = 'AMAZON',
  EBAY = 'EBAY',
  CUSTOM = 'CUSTOM',
}

export class CreateChannelDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ enum: ChannelPlatform }) @IsEnum(ChannelPlatform) platform: ChannelPlatform;
  @ApiPropertyOptional({ type: Object }) @IsOptional() @IsObject() credentials?: Record<string, any>;
  @ApiPropertyOptional({ type: Object }) @IsOptional() @IsObject() settings?: Record<string, any>;
}
