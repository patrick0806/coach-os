import { ApiProperty } from "@nestjs/swagger";

export class RecordExerciseSetResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  exerciseExecutionId: string;

  @ApiProperty()
  setNumber: number;

  @ApiProperty({ nullable: true })
  plannedReps: number | null;

  @ApiProperty({ nullable: true })
  performedReps: number | null;

  @ApiProperty({ nullable: true })
  plannedWeight: string | null;

  @ApiProperty({ nullable: true })
  usedWeight: string | null;

  @ApiProperty({ nullable: true })
  restSeconds: number | null;

  @ApiProperty({ example: "completed" })
  completionStatus: string;

  @ApiProperty()
  createdAt: Date;
}
