import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const CreateStudentNoteSchema = z.object({
  note: z.string().trim().min(1, "Nota é obrigatória").max(2000, "Nota deve ter no máximo 2000 caracteres"),
});

export type CreateStudentNoteInput = z.infer<typeof CreateStudentNoteSchema>;

export class CreateStudentNoteDTO implements CreateStudentNoteInput {
  @ApiProperty({ example: "Aluno relatou dor no ombro esquerdo ao fazer supino." })
  note: string;
}
