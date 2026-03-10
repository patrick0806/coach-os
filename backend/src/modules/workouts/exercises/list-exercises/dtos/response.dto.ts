import { ApiProperty } from "@nestjs/swagger";

export class ExerciseResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  muscleGroup: string;

  @ApiProperty({ nullable: true })
  exercisedbGifUrl: string | null;

  @ApiProperty({ nullable: true })
  youtubeUrl: string | null;

  @ApiProperty({ nullable: true })
  personalId: string | null;

  @ApiProperty({ description: "True if it is a global exercise (available to all personals)" })
  isGlobal: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
