import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class SetInventoryDto {
  @ApiProperty({ description: 'Inventory item ID' })
  @IsString()
  inventoryItemId: string;

  @ApiProperty({ description: 'Location ID' })
  @IsString()
  locationId: string;

  @ApiProperty({ description: 'Quantity to set (must be >= 0)', minimum: 0 })
  @IsInt()
  @Min(0)
  quantity: number;
}
