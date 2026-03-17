import { ApiProperty } from "@nestjs/swagger";

export class UpdateWorkoutTemplateRequestDTO {
  @ApiProperty({ example: "Treino B - Costas e Bíceps", minLength: 3, maxLength: 200, required: false })
  name?: string;
}
