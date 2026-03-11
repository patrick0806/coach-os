import { z } from "zod";

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
});

export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;
