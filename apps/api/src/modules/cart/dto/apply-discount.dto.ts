import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ApplyDiscountDto {
  @ApiProperty({ description: 'Discount code to apply' })
  @IsString()
  code: string;
}
