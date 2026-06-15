import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateZoneDto {
  @ApiProperty({ description: 'Zone name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'ISO 3166-1 alpha-2 country codes', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  countries?: string[];

  @ApiPropertyOptional({ description: 'Province/state codes', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  provinces?: string[];
}
