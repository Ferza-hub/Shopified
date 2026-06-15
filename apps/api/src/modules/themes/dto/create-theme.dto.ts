import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateThemeDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional({ enum: ['MAIN', 'UNPUBLISHED', 'DEMO'] })
  @IsOptional()
  @IsEnum(['MAIN', 'UNPUBLISHED', 'DEMO'])
  role?: string;
}
