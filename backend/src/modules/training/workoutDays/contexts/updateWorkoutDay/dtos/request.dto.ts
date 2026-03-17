import { ApiProperty } from "@nestjs/swagger";

export class UpdateWorkoutDayRequestDTO {
  @ApiProperty({ example: "Treino B - Costas", minLength: 3, maxLength: 200, required: false })
  name?: string;

  @ApiProperty({ example: "Treino focado em costas e bíceps", required: false, nullable: true })
  description?: string | null;

  @ApiProperty({ example: 1, required: false })
  order?: number;
}
