import { ApiProperty } from "@nestjs/swagger";

export class CoachStudentRelationResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  studentId: string;

  @ApiProperty({ enum: ["active", "paused", "archived"] })
  status: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty({ nullable: true })
  endDate: Date | null;

  @ApiProperty({ nullable: true })
  createdAt: Date | null;

  @ApiProperty({ nullable: true })
  updatedAt: Date | null;

  @ApiProperty()
  studentName: string;

  @ApiProperty()
  studentEmail: string;
}
