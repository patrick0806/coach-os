import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateServicePlanResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiProperty()
  price: string;

  @ApiPropertyOptional()
  sessionsPerWeek: number | null;

  @ApiPropertyOptional()
  durationMinutes: number | null;

  @ApiProperty({ enum: ["online", "presential"] })
  attendanceType: "online" | "presential";

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
