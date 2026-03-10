import { ApiProperty } from "@nestjs/swagger";

import { AvailabilitySlotDTO } from "../../shared/dtos/availability-slot.dto";

export class BulkAvailabilityResponseDTO {
  @ApiProperty({ example: 1 })
  dayOfWeek: number;

  @ApiProperty({ example: 8 })
  slotsCreated: number;

  @ApiProperty({ type: [AvailabilitySlotDTO] })
  slots: AvailabilitySlotDTO[];
}
