import { ApiProperty } from "@nestjs/swagger";

export class AddStudentExerciseRequestDTO {
  @ApiProperty({ example: "uuid-do-exercicio" })
  exerciseId: string;

  @ApiProperty({ example: 3 })
  sets: number;

  @ApiProperty({ example: 12, required: false })
  repetitions?: number;

  @ApiProperty({ example: "20kg", required: false })
  plannedWeight?: string;

  @ApiProperty({ example: 60, required: false })
  restSeconds?: number;

  @ApiProperty({ example: "00:01:00", required: false })
  duration?: string;

  @ApiProperty({ example: "Manter cotovelo fixo", required: false })
  notes?: string;
}
