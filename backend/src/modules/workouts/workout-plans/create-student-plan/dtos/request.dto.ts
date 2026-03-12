import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const CreateStudentPlanSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(150),
  description: z.string().max(1000).optional(),
  studentId: z.string().uuid("studentId inválido"),
});

export type CreateStudentPlanInput = z.infer<typeof CreateStudentPlanSchema>;

export class CreateStudentPlanDTO implements CreateStudentPlanInput {
  @ApiProperty({ example: "Treino A - João" })
  name: string;

  @ApiProperty({ required: false, example: "Foco em membros inferiores" })
  description?: string;

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  studentId: string;
}
