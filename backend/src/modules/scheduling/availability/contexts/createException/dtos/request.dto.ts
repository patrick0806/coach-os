import { ApiProperty } from "@nestjs/swagger";

export class CreateAvailabilityExceptionRequestDTO {
  @ApiProperty({ example: "2026-04-01", description: "YYYY-MM-DD format" })
  exceptionDate: string;

  @ApiProperty({ example: "Vacation day", required: false })
  reason?: string;
}
