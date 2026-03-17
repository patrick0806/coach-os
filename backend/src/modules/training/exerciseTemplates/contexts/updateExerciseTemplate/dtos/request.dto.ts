import { ApiProperty } from "@nestjs/swagger";

export class UpdateExerciseTemplateRequestDTO {
  @ApiProperty({ example: 4, required: false })
  sets?: number;

  @ApiProperty({ example: 12, required: false, nullable: true })
  repetitions?: number | null;

  @ApiProperty({ example: 60, required: false, nullable: true })
  restSeconds?: number | null;

  @ApiProperty({ example: "00:01:00", required: false, nullable: true })
  duration?: string | null;

  @ApiProperty({ example: "Manter cotovelo fixo", required: false, nullable: true })
  notes?: string | null;
}
