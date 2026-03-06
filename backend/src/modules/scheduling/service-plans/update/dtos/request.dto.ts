import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const UpdateServicePlanSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(150).optional(),
  description: z.string().max(1000).nullable().optional(),
  sessionsPerWeek: z
    .number()
    .int()
    .min(1, "sessionsPerWeek deve ser entre 1 e 7")
    .max(7, "sessionsPerWeek deve ser entre 1 e 7")
    .optional(),
  durationMinutes: z.number().int().min(1).optional(),
  price: z.number().nonnegative("Preço deve ser maior ou igual a zero").optional(),
});

export type UpdateServicePlanInput = z.infer<typeof UpdateServicePlanSchema>;

export class UpdateServicePlanDTO implements UpdateServicePlanInput {
  @ApiProperty({ required: false, example: "Plano Premium" })
  name?: string;

  @ApiProperty({ required: false, example: "5x por semana" })
  description?: string | null;

  @ApiProperty({ required: false, example: 5 })
  sessionsPerWeek?: number;

  @ApiProperty({ required: false, example: 90 })
  durationMinutes?: number;

  @ApiProperty({ required: false, example: 399.9 })
  price?: number;
}
