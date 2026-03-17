import { ApiProperty } from "@nestjs/swagger";

export class UpdateProgressRecordRequestDTO {
  @ApiProperty({ example: "weight", required: false })
  metricType?: string;

  @ApiProperty({ example: 85.0, required: false })
  value?: number;

  @ApiProperty({ example: "kg", required: false })
  unit?: string;

  @ApiProperty({ example: "2026-01-15T08:00:00Z", required: false })
  recordedAt?: string;

  @ApiProperty({ example: "Measured after morning fast", required: false, nullable: true })
  notes?: string | null;
}
