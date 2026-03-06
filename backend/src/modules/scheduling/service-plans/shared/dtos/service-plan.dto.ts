import { ApiProperty } from "@nestjs/swagger";

export class ServicePlanDTO {
  @ApiProperty({ example: "uuid" })
  id: string;

  @ApiProperty({ example: "personal-id" })
  personalId: string;

  @ApiProperty({ example: "Plano Básico" })
  name: string;

  @ApiProperty({ required: false, example: "3x por semana, foco em hipertrofia" })
  description: string | null;

  @ApiProperty({ example: 3 })
  sessionsPerWeek: number;

  @ApiProperty({ example: 60 })
  durationMinutes: number;

  @ApiProperty({ example: "299.90", description: "Price as string (numeric from DB)" })
  price: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
