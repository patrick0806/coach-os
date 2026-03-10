import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const ApplyTemplateSchema = z.object({
  studentId: z.string().uuid("Aluno inválido").optional(),
});

export type ApplyTemplateInput = z.infer<typeof ApplyTemplateSchema>;

export class ApplyTemplateDTO implements ApplyTemplateInput {
  @ApiProperty({ required: false, nullable: true, example: "7c14f8c8-8d08-4f40-9a0f-f5bd3474c8b9" })
  studentId?: string;
}
