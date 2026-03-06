import { ApiProperty } from "@nestjs/swagger";

export class WorkoutExerciseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  exerciseId: string;

  @ApiProperty()
  exerciseName: string;

  @ApiProperty()
  muscleGroup: string;

  @ApiProperty()
  sets: number;

  @ApiProperty()
  repetitions: number;

  @ApiProperty({ nullable: true })
  load: string | null;

  @ApiProperty()
  order: number;

  @ApiProperty({ nullable: true })
  notes: string | null;
}

export class WorkoutPlanDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  personalId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class WorkoutPlanDetailDTO extends WorkoutPlanDTO {
  @ApiProperty({ type: [WorkoutExerciseDTO] })
  exercises: WorkoutExerciseDTO[];
}

export class PaginatedWorkoutPlansDTO {
  @ApiProperty({ type: [WorkoutPlanDTO] })
  content: WorkoutPlanDTO[];

  @ApiProperty()
  page: number;

  @ApiProperty()
  size: number;

  @ApiProperty()
  totalElements: number;

  @ApiProperty()
  totalPages: number;
}
