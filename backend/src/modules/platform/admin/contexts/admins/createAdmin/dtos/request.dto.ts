import { z } from "zod";

export const createAdminSchema = z.object({
  name: z.string().min(3).max(150),
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
});

export type CreateAdminRequestDTO = z.infer<typeof createAdminSchema>;
