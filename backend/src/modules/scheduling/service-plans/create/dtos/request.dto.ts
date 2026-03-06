import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const CreateServicePlanSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(150),
  description: z.string().max(1000).optional(),
  sessionsPerWeek: z
    .number()
    .int()
    .min(1, "sessionsPerWeek deve ser entre 1 e 7")
    .max(7, "sessionsPerWeek deve ser entre 1 e 7"),
  durationMinutes: z.number().int().min(1).optional().default(60),
  price: z.number().nonnegative("Preço deve ser maior ou igual a zero"),
});

export type CreateServicePlanInput = z.input<typeof CreateServicePlanSchema>;

export class CreateServicePlanDTO implements CreateServicePlanInput {
  @ApiProperty({ example: "Plano Básico" })
  name: string;

  @ApiProperty({ required: false, example: "3x por semana, foco em hipertrofia" })
  description?: string;

  @ApiProperty({ example: 3 })
  sessionsPerWeek: number;

  @ApiProperty({ required: false, example: 60, default: 60 })
  durationMinutes?: number;

  @ApiProperty({ example: 299.9 })
  price: number;
}
