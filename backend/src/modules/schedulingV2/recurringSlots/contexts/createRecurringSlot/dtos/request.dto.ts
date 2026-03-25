import { ApiProperty } from "@nestjs/swagger";

export class CreateRecurringSlotRequestDTO {
  @ApiProperty({ example: "booking", description: "booking or block" })
  type: "booking" | "block";

  @ApiProperty({ example: 1, description: "0=Sunday, 1=Monday, ..., 6=Saturday" })
  dayOfWeek: number;

  @ApiProperty({ example: "10:00", description: "HH:MM format" })
  startTime: string;

  @ApiProperty({ example: "11:00", description: "HH:MM format" })
  endTime: string;

  @ApiProperty({ example: "2026-04-01", description: "YYYY-MM-DD format" })
  effectiveFrom: string;

  @ApiProperty({ example: "student-uuid", required: false })
  studentId?: string;

  @ApiProperty({ example: "Academia XYZ", required: false })
  location?: string;
}
