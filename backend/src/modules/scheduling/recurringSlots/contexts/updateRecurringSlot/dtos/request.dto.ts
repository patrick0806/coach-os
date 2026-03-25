import { ApiProperty } from "@nestjs/swagger";

export class UpdateRecurringSlotRequestDTO {
  @ApiProperty({ example: 1, description: "0=Sunday, 1=Monday, ..., 6=Saturday", required: false })
  dayOfWeek?: number;

  @ApiProperty({ example: "10:00", description: "HH:MM format", required: false })
  startTime?: string;

  @ApiProperty({ example: "11:00", description: "HH:MM format", required: false })
  endTime?: string;

  @ApiProperty({ example: "Academia XYZ", required: false })
  location?: string | null;
}
