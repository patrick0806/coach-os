import { ApiProperty } from "@nestjs/swagger";

export class AddWorkoutDayRequestDTO {
  @ApiProperty({ example: "Treino A" })
  name: string;

  @ApiProperty({ example: "Foco em membros superiores", required: false })
  description?: string;
}
