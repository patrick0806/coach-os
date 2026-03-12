import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const UpdateStepSchema = z.object({
  currentStep: z.number().int().min(0, "currentStep deve ser maior ou igual a zero"),
});

export type UpdateStepInput = z.infer<typeof UpdateStepSchema>;

export class UpdateStepDTO implements UpdateStepInput {
  @ApiProperty({ example: 2 })
  currentStep: number;
}
