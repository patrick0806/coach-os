import { ApiProperty } from "@nestjs/swagger";

export class StudentNoteResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  studentId: string;

  @ApiProperty()
  personalId: string;

  @ApiProperty()
  note: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
