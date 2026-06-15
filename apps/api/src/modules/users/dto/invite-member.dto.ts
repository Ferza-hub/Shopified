import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StoreRole } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class InviteMemberDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ enum: StoreRole, default: StoreRole.STAFF })
  @IsOptional()
  @IsEnum(StoreRole)
  role?: StoreRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;
}
