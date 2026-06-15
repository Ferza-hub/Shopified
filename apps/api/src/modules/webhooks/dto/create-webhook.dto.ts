import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUrl, IsIn, IsOptional } from 'class-validator';
import { WEBHOOK_TOPICS } from '../webhook-topics';

export class CreateWebhookDto {
  @ApiProperty() @IsUrl() address: string;
  @ApiProperty({ enum: WEBHOOK_TOPICS }) @IsIn(WEBHOOK_TOPICS) topic: string;
  @ApiPropertyOptional() @IsOptional() @IsString() secret?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() format?: string;
}
