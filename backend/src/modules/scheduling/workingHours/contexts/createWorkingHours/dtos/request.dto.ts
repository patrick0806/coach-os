import { ApiProperty } from "@nestjs/swagger";

export class CreateWorkingHoursRequestDTO {
  @ApiProperty({ example: 1, description: "0=Sunday, 1=Monday, ..., 6=Saturday" })
  dayOfWeek: number;

  @ApiProperty({ example: "08:00", description: "HH:MM format" })
  startTime: string;

  @ApiProperty({ example: "12:00", description: "HH:MM format" })
  endTime: string;

  @ApiProperty({ example: "2026-04-01", description: "YYYY-MM-DD format" })
  effectiveFrom: string;
}
