import { ApiProperty } from "@nestjs/swagger";

export class UpdateWorkingHoursRequestDTO {
  @ApiProperty({
    example: 1,
    description: "0=Sunday, 1=Monday, ..., 6=Saturday",
    required: false,
  })
  dayOfWeek?: number;

  @ApiProperty({ example: "08:00", description: "HH:MM format", required: false })
  startTime?: string;

  @ApiProperty({ example: "12:00", description: "HH:MM format", required: false })
  endTime?: string;
}
