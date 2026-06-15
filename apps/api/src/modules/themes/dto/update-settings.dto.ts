import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  settings: Record<string, any>;
}
