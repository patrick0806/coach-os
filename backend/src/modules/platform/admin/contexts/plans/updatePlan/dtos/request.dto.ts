import { z } from "zod";

export const updatePlanSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  maxStudents: z.number().int().positive().optional(),
  description: z.string().max(500).nullable().optional(),
  highlighted: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  benefits: z.array(z.string()).nullable().optional(),
  stripePriceId: z.string().nullable().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export type UpdatePlanRequestDTO = z.infer<typeof updatePlanSchema>;
