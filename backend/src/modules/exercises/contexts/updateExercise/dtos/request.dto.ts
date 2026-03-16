import { ApiProperty } from "@nestjs/swagger";

export class UpdateExerciseRequestDTO {
  @ApiProperty({ example: "Supino Inclinado", required: false, minLength: 3, maxLength: 200 })
  name?: string;

  @ApiProperty({ example: "peitoral superior", required: false, maxLength: 100 })
  muscleGroup?: string;

  @ApiProperty({ example: "Exercício para peitoral superior", required: false, nullable: true })
  description?: string | null;

  @ApiProperty({ example: "Incline o banco a 45 graus...", required: false, nullable: true })
  instructions?: string | null;

  @ApiProperty({ example: "https://s3.amazonaws.com/bucket/exercise.jpg", required: false, nullable: true })
  mediaUrl?: string | null;

  @ApiProperty({ example: "https://youtube.com/watch?v=abc123", required: false, nullable: true })
  youtubeUrl?: string | null;
}
