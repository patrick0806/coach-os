import { z } from "zod";

export const LoginRequestSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type LoginRequestDTO = z.infer<typeof LoginRequestSchema>;
export type LoginServiceInput = LoginRequestDTO;
