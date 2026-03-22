import { ApiProperty } from "@nestjs/swagger";

class ExerciseSetResponseDTO {
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
}

class ExerciseExecutionResponseDTO {
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

  @ApiProperty({ type: [ExerciseSetResponseDTO] })
  exerciseSets: ExerciseSetResponseDTO[];
}

export class StartWorkoutSessionResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  studentId: string;

  @ApiProperty()
  workoutDayId: string;

  @ApiProperty({ example: "started" })
  status: string;

  @ApiProperty()
  startedAt: Date;

  @ApiProperty({ nullable: true })
  finishedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [ExerciseExecutionResponseDTO] })
  exerciseExecutions: ExerciseExecutionResponseDTO[];
}
