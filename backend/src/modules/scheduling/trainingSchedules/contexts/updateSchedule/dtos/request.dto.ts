import { ApiProperty } from "@nestjs/swagger";

export class UpdateTrainingScheduleRequestDTO {
  @ApiProperty({ example: 1, required: false })
  dayOfWeek?: number;

  @ApiProperty({ example: "10:00", required: false })
  startTime?: string;

  @ApiProperty({ example: "11:00", required: false })
  endTime?: string;

  @ApiProperty({ example: "Academia XYZ", required: false })
  location?: string | null;
}
