import { ApiProperty } from "@nestjs/swagger";

export class CreateExerciseExecutionResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  workoutSessionId: string;

  @ApiProperty()
  studentExerciseId: string;

  @ApiProperty()
  exerciseId: string;

  @ApiProperty()
  order: number;

  @ApiProperty({ nullable: true })
  startedAt: Date | null;

  @ApiProperty({ nullable: true })
  finishedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
