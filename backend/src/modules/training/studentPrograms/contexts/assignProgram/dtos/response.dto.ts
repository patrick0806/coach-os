import { ApiProperty } from "@nestjs/swagger";

export class AssignProgramResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  studentId: string;

  @ApiProperty({ required: false, nullable: true })
  programTemplateId: string | null;

  @ApiProperty()
  name: string;

  @ApiProperty({ example: "active" })
  status: string;

  @ApiProperty({ nullable: true })
  startedAt: Date | null;

  @ApiProperty({ nullable: true })
  finishedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
