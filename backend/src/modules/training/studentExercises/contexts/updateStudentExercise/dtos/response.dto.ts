import { ApiProperty } from "@nestjs/swagger";

export class UpdateStudentExerciseResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  workoutDayId: string;

  @ApiProperty()
  exerciseId: string;

  @ApiProperty()
  sets: number;

  @ApiProperty({ nullable: true })
  repetitions: number | null;

  @ApiProperty({ nullable: true })
  plannedWeight: string | null;

  @ApiProperty({ nullable: true })
  restSeconds: number | null;

  @ApiProperty({ nullable: true })
  duration: string | null;

  @ApiProperty()
  order: number;

  @ApiProperty({ nullable: true })
  notes: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
