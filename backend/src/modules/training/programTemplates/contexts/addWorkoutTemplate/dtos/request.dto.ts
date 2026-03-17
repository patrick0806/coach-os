import { ApiProperty } from "@nestjs/swagger";

export class AddWorkoutTemplateRequestDTO {
  @ApiProperty({ example: "Treino A - Peito e Tríceps", minLength: 3, maxLength: 200 })
  name: string;
}
