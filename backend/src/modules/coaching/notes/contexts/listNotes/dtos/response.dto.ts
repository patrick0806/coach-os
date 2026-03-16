import { ApiProperty } from "@nestjs/swagger";

export class NoteResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  studentId: string;

  @ApiProperty()
  note: string;

  @ApiProperty({ nullable: true })
  createdAt: Date | null;

  @ApiProperty({ nullable: true })
  updatedAt: Date | null;
}
