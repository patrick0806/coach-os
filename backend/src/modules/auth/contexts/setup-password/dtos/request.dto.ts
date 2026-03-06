import { z } from "zod";

export const SetupPasswordSchema = z
  .object({
    token: z.string().min(1, "Token é obrigatório"),
    password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

export type SetupPasswordDTO = z.infer<typeof SetupPasswordSchema>;
