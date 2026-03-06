import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const UpdateWorkoutPlanSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  description: z.string().max(1000).nullable().optional(),
});

export type UpdateWorkoutPlanInput = z.infer<typeof UpdateWorkoutPlanSchema>;

export class UpdateWorkoutPlanDTO implements UpdateWorkoutPlanInput {
  @ApiProperty({ required: false, example: "Treino A Atualizado" })
  name?: string;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;
}
