import { ApiProperty } from "@nestjs/swagger";

export class FinishWorkoutSessionResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  studentId: string;

  @ApiProperty()
  workoutDayId: string;

  @ApiProperty({ example: "finished" })
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
