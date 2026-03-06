import { z } from "zod";
import { ApiPropertyOptional } from "@nestjs/swagger";

export const UpdatePlanSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  description: z.string().min(1).max(255).optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Formato de preço inválido (ex: 29.90)").optional(),
  benefits: z.array(z.string()).min(1).optional(),
  highlighted: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  maxStudents: z.number().int().positive().nullable().optional(),
});

export type UpdatePlanInput = z.infer<typeof UpdatePlanSchema>;

export class UpdatePlanDTO implements UpdatePlanInput {
  @ApiPropertyOptional({ example: "Pro Plus" })
  name?: string;

  @ApiPropertyOptional({ example: "Plano Pro aprimorado" })
  description?: string;

  @ApiPropertyOptional({ example: "39.90" })
  price?: string;

  @ApiPropertyOptional({ example: ["Ate 20 alunos"], type: [String] })
  benefits?: string[];

  @ApiPropertyOptional({ example: true })
  highlighted?: boolean;

  @ApiPropertyOptional({ example: 1 })
  order?: number;

  @ApiPropertyOptional({ example: 20, nullable: true })
  maxStudents?: number | null;
}
