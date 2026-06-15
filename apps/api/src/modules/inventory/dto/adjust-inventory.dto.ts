import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class AdjustInventoryDto {
  @ApiProperty({ description: 'Inventory item ID' })
  @IsString()
  inventoryItemId: string;

  @ApiProperty({ description: 'Location ID' })
  @IsString()
  locationId: string;

  @ApiProperty({ description: 'Amount to adjust (positive or negative)' })
  @IsInt()
  adjustment: number;
}
