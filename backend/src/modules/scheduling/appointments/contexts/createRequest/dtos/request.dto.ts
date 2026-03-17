import { ApiProperty } from "@nestjs/swagger";

export class CreateAppointmentRequestRequestDTO {
  @ApiProperty({ example: "2026-04-06T00:00:00Z" })
  requestedDate: string;

  @ApiProperty({ example: "10:00" })
  requestedStartTime: string;

  @ApiProperty({ example: "11:00" })
  requestedEndTime: string;

  @ApiProperty({ example: "Would like to discuss training plan", required: false })
  notes?: string;
}
