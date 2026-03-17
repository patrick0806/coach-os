import { ApiProperty } from "@nestjs/swagger";

export class AddExerciseTemplateRequestDTO {
  @ApiProperty({ example: "uuid-do-exercicio" })
  exerciseId: string;

  @ApiProperty({ example: 4 })
  sets: number;

  @ApiProperty({ example: 12, required: false })
  repetitions?: number;

  @ApiProperty({ example: 60, required: false })
  restSeconds?: number;

  @ApiProperty({ example: "00:01:00", required: false })
  duration?: string;

  @ApiProperty({ example: "Manter cotovelo fixo", required: false })
  notes?: string;
}
