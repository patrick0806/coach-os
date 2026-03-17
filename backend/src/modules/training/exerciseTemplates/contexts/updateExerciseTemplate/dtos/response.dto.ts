import { ApiProperty } from "@nestjs/swagger";

export class UpdateExerciseTemplateResponseDTO {
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
}
