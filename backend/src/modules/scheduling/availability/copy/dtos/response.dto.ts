import { ApiProperty } from "@nestjs/swagger";

export class CopyAvailabilityResponseDTO {
  @ApiProperty({ type: [Number], example: [2, 4, 5] })
  copiedToDays: number[];

  @ApiProperty({ example: 12 })
  totalSlotsCreated: number;
}
