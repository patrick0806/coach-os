import { z } from "zod";

export const CreateStudentSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.email("E-mail inválido"),
});

export type CreateStudentDTO = z.infer<typeof CreateStudentSchema>;
