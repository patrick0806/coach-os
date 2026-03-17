import { ApiProperty } from "@nestjs/swagger";

export class AddWorkoutTemplateResponseDTO {
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
