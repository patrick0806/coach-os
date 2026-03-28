import { ApiProperty } from "@nestjs/swagger";

export class AddWorkoutDayResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  studentProgramId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false, nullable: true })
  description: string | null;

  @ApiProperty()
  order: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
