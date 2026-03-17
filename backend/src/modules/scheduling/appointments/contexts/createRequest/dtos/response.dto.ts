import { ApiProperty } from "@nestjs/swagger";

export class CreateAppointmentRequestResponseDTO {
  @ApiProperty({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" })
  id: string;

  @ApiProperty({ example: "c3d4e5f6-a7b8-9012-cdef-012345678902" })
  tenantId: string;

  @ApiProperty({ example: "b2c3d4e5-f6a7-8901-bcde-f01234567891" })
  studentId: string;

  @ApiProperty({ example: "2026-04-06T00:00:00Z" })
  requestedDate: Date;

  @ApiProperty({ example: "10:00" })
  requestedStartTime: string;

  @ApiProperty({ example: "11:00" })
  requestedEndTime: string;

  @ApiProperty({ example: "pending" })
  status: string;

  @ApiProperty()
  createdAt: Date | null;

  @ApiProperty()
  updatedAt: Date | null;
}
