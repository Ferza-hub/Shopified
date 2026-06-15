import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class ReviewQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() productId?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(5) @Type(() => Number) rating?: number;
  @ApiPropertyOptional({ enum: ['PENDING','APPROVED','REJECTED','SPAM'] }) @IsOptional() @IsEnum(['PENDING','APPROVED','REJECTED','SPAM']) status?: string;
}
