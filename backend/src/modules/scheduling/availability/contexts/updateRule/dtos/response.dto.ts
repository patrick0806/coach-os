import { ApiProperty } from "@nestjs/swagger";

export class UpdateAvailabilityRuleResponseDTO {
  @ApiProperty({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" })
  id: string;

  @ApiProperty({ example: "c3d4e5f6-a7b8-9012-cdef-012345678902" })
  tenantId: string;

  @ApiProperty({ example: 1 })
  dayOfWeek: number;

  @ApiProperty({ example: "08:00" })
  startTime: string;

  @ApiProperty({ example: "12:00" })
  endTime: string;

  @ApiProperty({ example: true })
  isActive: boolean | null;

  @ApiProperty()
  createdAt: Date | null;

  @ApiProperty()
  updatedAt: Date | null;
}
