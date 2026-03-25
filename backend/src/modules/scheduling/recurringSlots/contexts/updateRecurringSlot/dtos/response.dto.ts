import { ApiProperty } from "@nestjs/swagger";

export class UpdateRecurringSlotResponseDTO {
  @ApiProperty({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" })
  id: string;

  @ApiProperty({ example: "c3d4e5f6-a7b8-9012-cdef-012345678902" })
  tenantId: string;

  @ApiProperty({ example: "b2c3d4e5-f6a7-8901-bcde-f01234567891", required: false })
  studentId: string | null;

  @ApiProperty({ example: null, required: false })
  studentProgramId: string | null;

  @ApiProperty({ example: "booking" })
  type: string;

  @ApiProperty({ example: 1 })
  dayOfWeek: number;

  @ApiProperty({ example: "10:00" })
  startTime: string;

  @ApiProperty({ example: "11:00" })
  endTime: string;

  @ApiProperty({ example: "2026-04-01" })
  effectiveFrom: string;

  @ApiProperty({ example: null, required: false })
  effectiveTo: string | null;

  @ApiProperty({ example: "Academia XYZ", required: false })
  location: string | null;

  @ApiProperty({ example: true })
  isActive: boolean | null;

  @ApiProperty()
  createdAt: Date | null;

  @ApiProperty()
  updatedAt: Date | null;
}
