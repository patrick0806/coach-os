import { z } from "zod";

export const UpdateStudentSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").optional(),
    email: z.email("E-mail inválido").optional(),
  })
  .refine((data) => data.name !== undefined || data.email !== undefined, {
    message: "Informe ao menos um campo para atualizar",
  });

export type UpdateStudentDTO = z.infer<typeof UpdateStudentSchema>;
