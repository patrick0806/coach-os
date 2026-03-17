import { ApiProperty } from "@nestjs/swagger";

export class CreateTrainingScheduleResponseDTO {
  @ApiProperty({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" })
  id: string;

  @ApiProperty({ example: "c3d4e5f6-a7b8-9012-cdef-012345678902" })
  tenantId: string;

  @ApiProperty({ example: "b2c3d4e5-f6a7-8901-bcde-f01234567891" })
  studentId: string;

  @ApiProperty({ example: "d4e5f6a7-b890-1234-cdef-567890abcdef", required: false })
  studentProgramId: string | null;

  @ApiProperty({ example: 1 })
  dayOfWeek: number;

  @ApiProperty({ example: "10:00" })
  startTime: string;

  @ApiProperty({ example: "11:00" })
  endTime: string;

  @ApiProperty({ example: "Academia XYZ", required: false })
  location: string | null;

  @ApiProperty({ example: true })
  isActive: boolean | null;

  @ApiProperty()
  createdAt: Date | null;

  @ApiProperty()
  updatedAt: Date | null;
}
