import { ApiProperty } from "@nestjs/swagger";

export class CreateAppointmentResponseDTO {
  @ApiProperty({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" })
  id: string;

  @ApiProperty({ example: "c3d4e5f6-a7b8-9012-cdef-012345678902" })
  tenantId: string;

  @ApiProperty({ example: "b2c3d4e5-f6a7-8901-bcde-f01234567891" })
  studentId: string;

  @ApiProperty({ example: "2026-04-06T10:00:00Z" })
  startAt: Date;

  @ApiProperty({ example: "2026-04-06T11:00:00Z" })
  endAt: Date;

  @ApiProperty({ example: "presential" })
  appointmentType: string;

  @ApiProperty({ example: "scheduled" })
  status: string;

  @ApiProperty({ example: "https://meet.google.com/xyz", required: false })
  meetingUrl: string | null;

  @ApiProperty({ example: "Academia XYZ", required: false })
  location: string | null;

  @ApiProperty()
  createdAt: Date | null;

  @ApiProperty()
  updatedAt: Date | null;
}
