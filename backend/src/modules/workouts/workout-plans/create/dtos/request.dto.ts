import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const CreateWorkoutPlanSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(150),
  description: z.string().max(1000).optional(),
  planKind: z.enum(["template", "student"]).default("template"),
});

export type CreateWorkoutPlanInput = z.input<typeof CreateWorkoutPlanSchema>;

export class CreateWorkoutPlanDTO implements CreateWorkoutPlanInput {
  @ApiProperty({ example: "Treino A" })
  name: string;

  @ApiProperty({ required: false, example: "Foco em membros superiores" })
  description?: string;

  @ApiProperty({ required: false, enum: ["template", "student"], default: "template" })
  planKind?: "template" | "student";
}
