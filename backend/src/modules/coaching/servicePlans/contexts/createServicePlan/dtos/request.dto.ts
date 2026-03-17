import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateServicePlanRequestDTO {
  @ApiProperty({ example: "Consultoria Online Mensal" })
  name: string;

  @ApiPropertyOptional({ example: "Acompanhamento online com treinos personalizados" })
  description?: string;

  @ApiProperty({ example: 49.9 })
  price: number;

  @ApiPropertyOptional({ example: 3 })
  sessionsPerWeek?: number;

  @ApiPropertyOptional({ example: 60 })
  durationMinutes?: number;

  @ApiProperty({ enum: ["online", "presential"], example: "online" })
  attendanceType: "online" | "presential";
}
