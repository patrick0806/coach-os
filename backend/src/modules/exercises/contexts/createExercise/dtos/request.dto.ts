import { ApiProperty } from "@nestjs/swagger";

export class CreateExerciseRequestDTO {
  @ApiProperty({ example: "Supino Reto", minLength: 3, maxLength: 200 })
  name: string;

  @ApiProperty({ example: "peitoral", maxLength: 100 })
  muscleGroup: string;

  @ApiProperty({ example: "Exercício para peitoral maior", required: false })
  description?: string;

  @ApiProperty({ example: "Deite no banco, segure a barra...", required: false })
  instructions?: string;

  @ApiProperty({ example: "https://youtube.com/watch?v=abc123", required: false })
  youtubeUrl?: string;
}
