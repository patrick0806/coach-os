import { z } from "zod";

export const createPlanSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  maxStudents: z.number().int().positive(),
  description: z.string().max(500).optional(),
  highlighted: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  benefits: z.array(z.string()).optional(),
  stripePriceId: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type CreatePlanRequestDTO = z.infer<typeof createPlanSchema>;
