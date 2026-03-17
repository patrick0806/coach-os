import { ApiProperty } from "@nestjs/swagger";

export class CreateProgressRecordRequestDTO {
  @ApiProperty({ example: "weight" })
  metricType: string;

  @ApiProperty({ example: 80.5 })
  value: number;

  @ApiProperty({ example: "kg" })
  unit: string;

  @ApiProperty({ example: "2026-01-15T08:00:00Z" })
  recordedAt: string;

  @ApiProperty({ example: "Measured after morning fast", required: false })
  notes?: string;
}
