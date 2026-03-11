import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const UpdateStudentNoteSchema = z.object({
  note: z.string().trim().min(1, "Nota é obrigatória").max(2000, "Nota deve ter no máximo 2000 caracteres"),
});

export type UpdateStudentNoteInput = z.infer<typeof UpdateStudentNoteSchema>;

export class UpdateStudentNoteDTO implements UpdateStudentNoteInput {
  @ApiProperty({ example: "Texto atualizado da nota." })
  note: string;
}
