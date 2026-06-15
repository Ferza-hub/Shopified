import { ApiProperty } from '@nestjs/swagger';
import { StoreRole } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: StoreRole })
  @IsEnum(StoreRole)
  role: StoreRole;
}
