import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateServicePlanRequestDTO {
  @ApiPropertyOptional({ example: "Consultoria Online Premium" })
  name?: string;

  @ApiPropertyOptional({ example: "Acompanhamento online com treinos personalizados" })
  description?: string;

  @ApiPropertyOptional({ example: 69.9 })
  price?: number;

  @ApiPropertyOptional({ example: 4 })
  sessionsPerWeek?: number;

  @ApiPropertyOptional({ example: 60 })
  durationMinutes?: number;

  @ApiPropertyOptional({ enum: ["online", "presential"] })
  attendanceType?: "online" | "presential";

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;
}
