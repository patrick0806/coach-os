import { ApiProperty } from "@nestjs/swagger";

export class PauseWorkoutSessionResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  studentId: string;

  @ApiProperty()
  workoutDayId: string;

  @ApiProperty({ example: "paused" })
  status: string;

  @ApiProperty()
  startedAt: Date;

  @ApiProperty({ nullable: true })
  finishedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
