import { ApiProperty } from "@nestjs/swagger";

export class CreateTrainingScheduleRequestDTO {
  @ApiProperty({ example: 1, description: "0=Sunday, 1=Monday, ..., 6=Saturday" })
  dayOfWeek: number;

  @ApiProperty({ example: "10:00", description: "HH:MM format" })
  startTime: string;

  @ApiProperty({ example: "11:00", description: "HH:MM format" })
  endTime: string;

  @ApiProperty({ example: "program-uuid", required: false })
  studentProgramId?: string;

  @ApiProperty({ example: "Academia XYZ", required: false })
  location?: string;
}
