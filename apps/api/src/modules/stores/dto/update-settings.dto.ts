import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orderPrefix?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  weightUnit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dimensionUnit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowGuestCheckout?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requireEmailVerification?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autoFulfillDigital?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  facebookPixelId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  googleAnalyticsId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tiktokPixelId?: string;
}
