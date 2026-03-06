import { z } from "zod";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export const CreatePlanSchema = z.object({
  name: z.string().min(1).max(150),
  description: z.string().min(1).max(255),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Formato de preço inválido (ex: 29.90)"),
  benefits: z.array(z.string()).min(1),
  highlighted: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  maxStudents: z.number().int().positive().nullable().default(null),
});

export type CreatePlanInput = z.input<typeof CreatePlanSchema>;

export class CreatePlanDTO implements CreatePlanInput {
  @ApiProperty({ example: "Enterprise" })
  name: string;

  @ApiProperty({ example: "Plano para grandes academias" })
  description: string;

  @ApiProperty({ example: "99.90" })
  price: string;

  @ApiProperty({ example: ["Alunos ilimitados", "Suporte dedicado"], type: [String] })
  benefits: string[];

  @ApiPropertyOptional({ example: false })
  highlighted?: boolean;

  @ApiPropertyOptional({ example: 3 })
  order?: number;

  @ApiPropertyOptional({ example: null, nullable: true })
  maxStudents?: number | null;
}
