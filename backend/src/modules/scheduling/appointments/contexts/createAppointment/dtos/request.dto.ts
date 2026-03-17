import { ApiProperty } from "@nestjs/swagger";

export class CreateAppointmentRequestDTO {
  @ApiProperty({ example: "student-uuid" })
  studentId: string;

  @ApiProperty({ example: "2026-04-06T10:00:00Z" })
  startAt: string;

  @ApiProperty({ example: "2026-04-06T11:00:00Z" })
  endAt: string;

  @ApiProperty({ example: "presential", enum: ["online", "presential"] })
  appointmentType: string;

  @ApiProperty({ example: "https://meet.google.com/xyz", required: false })
  meetingUrl?: string;

  @ApiProperty({ example: "Academia XYZ", required: false })
  location?: string;

  @ApiProperty({ example: "Regular training session", required: false })
  notes?: string;

  @ApiProperty({ example: false, required: false })
  forceCreate?: boolean;
}
