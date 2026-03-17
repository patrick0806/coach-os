import { ApiProperty } from "@nestjs/swagger";

export class UpdateWorkoutDayResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  studentProgramId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  order: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
