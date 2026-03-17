import { ApiProperty } from "@nestjs/swagger";

export class UpdateAvailabilityRuleRequestDTO {
  @ApiProperty({ example: 1, required: false })
  dayOfWeek?: number;

  @ApiProperty({ example: "08:00", required: false })
  startTime?: string;

  @ApiProperty({ example: "12:00", required: false })
  endTime?: string;
}
