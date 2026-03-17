import { ApiProperty } from "@nestjs/swagger";

export class CreateAvailabilityExceptionResponseDTO {
  @ApiProperty({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" })
  id: string;

  @ApiProperty({ example: "c3d4e5f6-a7b8-9012-cdef-012345678902" })
  tenantId: string;

  @ApiProperty({ example: "2026-04-01" })
  exceptionDate: string;

  @ApiProperty({ example: "Vacation day", required: false })
  reason: string | null;

  @ApiProperty()
  createdAt: Date | null;

  @ApiProperty()
  updatedAt: Date | null;
}
