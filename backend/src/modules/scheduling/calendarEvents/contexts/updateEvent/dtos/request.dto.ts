import { ApiProperty } from "@nestjs/swagger";

export class UpdateEventRequestDTO {
  @ApiProperty({ example: "2026-04-06T10:00:00Z", required: false })
  startAt?: string;

  @ApiProperty({ example: "2026-04-06T11:00:00Z", required: false })
  endAt?: string;

  @ApiProperty({ example: "presential", enum: ["online", "presential"], required: false })
  appointmentType?: string;

  @ApiProperty({ example: "https://meet.google.com/xyz", required: false })
  meetingUrl?: string;

  @ApiProperty({ example: "Academia XYZ", required: false })
  location?: string;

  @ApiProperty({ example: "Updated notes", required: false })
  notes?: string;

  @ApiProperty({ example: false, required: false })
  forceCreate?: boolean;
}
