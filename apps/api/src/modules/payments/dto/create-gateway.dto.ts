import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateGatewayDto {
  @ApiProperty({ description: 'Gateway display name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Gateway provider (stripe, paypal, etc.)' })
  @IsString()
  provider: string;

  @ApiPropertyOptional({ description: 'Whether this gateway is enabled' })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Whether this is the default gateway' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Gateway public configuration' })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Gateway secret credentials' })
  @IsOptional()
  @IsObject()
  credentials?: Record<string, any>;
}
