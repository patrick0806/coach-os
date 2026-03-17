import { ApiProperty } from "@nestjs/swagger";

class ExerciseInfoDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  muscleGroup: string;

  @ApiProperty({ required: false, nullable: true })
  mediaUrl: string | null;
}

class ExerciseTemplateDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  workoutTemplateId: string;

  @ApiProperty()
  exerciseId: string;

  @ApiProperty()
  sets: number;

  @ApiProperty({ required: false, nullable: true })
  repetitions: number | null;

  @ApiProperty({ required: false, nullable: true })
  restSeconds: number | null;

  @ApiProperty({ required: false, nullable: true })
  duration: string | null;

  @ApiProperty({ required: false, nullable: true })
  notes: string | null;

  @ApiProperty()
  order: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: ExerciseInfoDTO })
  exercise: ExerciseInfoDTO;
}

class WorkoutTemplateDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  programTemplateId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  order: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [ExerciseTemplateDTO] })
  exerciseTemplates: ExerciseTemplateDTO[];
}

export class GetProgramTemplateResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false, nullable: true })
  description: string | null;

  @ApiProperty({ example: "active", enum: ["active", "archived"] })
  status: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [WorkoutTemplateDTO] })
  workoutTemplates: WorkoutTemplateDTO[];
}
