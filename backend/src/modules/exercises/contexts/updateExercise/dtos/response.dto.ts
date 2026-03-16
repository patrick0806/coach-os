import { ApiProperty } from "@nestjs/swagger";

export class UpdateExerciseResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  muscleGroup: string;

  @ApiProperty({ required: false, nullable: true })
  description: string | null;

  @ApiProperty({ required: false, nullable: true })
  instructions: string | null;

  @ApiProperty({ required: false, nullable: true })
  mediaUrl: string | null;

  @ApiProperty({ required: false, nullable: true })
  youtubeUrl: string | null;

  @ApiProperty({ nullable: true })
  tenantId: string | null;

  @ApiProperty()
  createdAt: Date | null;

  @ApiProperty()
  updatedAt: Date | null;
}
