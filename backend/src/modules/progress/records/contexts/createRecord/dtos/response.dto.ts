import { ApiProperty } from "@nestjs/swagger";

export class CreateProgressRecordResponseDTO {
  @ApiProperty({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" })
  id: string;

  @ApiProperty({ example: "c3d4e5f6-a7b8-9012-cdef-012345678902" })
  tenantId: string;

  @ApiProperty({ example: "b2c3d4e5-f6a7-8901-bcde-f01234567891" })
  studentId: string;

  @ApiProperty({ example: "weight" })
  metricType: string;

  @ApiProperty({ example: "80.50" })
  value: string;

  @ApiProperty({ example: "kg" })
  unit: string;

  @ApiProperty({ example: "2026-01-15T08:00:00Z" })
  recordedAt: Date;

  @ApiProperty({ example: "Measured after morning fast", required: false })
  notes: string | null;

  @ApiProperty()
  createdAt: Date | null;

  @ApiProperty()
  updatedAt: Date | null;
}
