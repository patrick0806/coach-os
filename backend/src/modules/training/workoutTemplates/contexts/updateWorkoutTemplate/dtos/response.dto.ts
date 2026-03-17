import { ApiProperty } from "@nestjs/swagger";

export class UpdateWorkoutTemplateResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  programTemplateId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  order: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
