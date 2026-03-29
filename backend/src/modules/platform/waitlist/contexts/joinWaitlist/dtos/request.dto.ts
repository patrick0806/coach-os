import { z } from "zod";

export const joinWaitlistSchema = z.object({
  email: z
    .string()
    .email("Email inválido")
    .max(255)
    .transform((val) => val.toLowerCase().trim()),
  name: z.string().max(150).optional(),
});

export type JoinWaitlistRequestDTO = z.infer<typeof joinWaitlistSchema>;
