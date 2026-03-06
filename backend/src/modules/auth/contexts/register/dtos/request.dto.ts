import { z } from "zod";

export const RegisterRequestSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type RegisterRequestDTO = z.infer<typeof RegisterRequestSchema>;

export type RegisterServiceInput = Pick<
  RegisterRequestDTO,
  "name" | "email" | "password"
>;
