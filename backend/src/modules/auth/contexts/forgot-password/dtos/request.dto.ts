import { z } from "zod";

export const ForgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordSchema>;
