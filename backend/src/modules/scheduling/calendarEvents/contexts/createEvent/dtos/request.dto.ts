import { ApiProperty } from "@nestjs/swagger";

export class CreateEventRequestDTO {
  @ApiProperty({ example: "one_off", enum: ["one_off", "override", "block"] })
  type: string;

  @ApiProperty({ example: "2026-04-06T10:00:00Z" })
  startAt: string;

  @ApiProperty({ example: "2026-04-06T11:00:00Z" })
  endAt: string;

  @ApiProperty({ example: "scheduled", required: false })
  status?: string;

  @ApiProperty({ example: "student-uuid", required: false })
  studentId?: string;

  @ApiProperty({ example: "recurring-slot-uuid", required: false })
  recurringSlotId?: string;

  @ApiProperty({ example: "2026-04-06T10:00:00Z", required: false })
  originalStartAt?: string;

  @ApiProperty({ example: "presential", enum: ["online", "presential"], required: false })
  appointmentType?: string;

  @ApiProperty({ example: "https://meet.google.com/xyz", required: false })
  meetingUrl?: string;

  @ApiProperty({ example: "Academia XYZ", required: false })
  location?: string;

  @ApiProperty({ example: "Regular training session", required: false })
  notes?: string;

  @ApiProperty({ example: false, required: false })
  forceCreate?: boolean;
}
