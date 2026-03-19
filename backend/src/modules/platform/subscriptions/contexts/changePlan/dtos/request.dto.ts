import { z } from "zod";

export const changePlanSchema = z.object({
  planId: z.string().uuid("planId must be a valid UUID"),
});

export type ChangePlanRequestDTO = z.infer<typeof changePlanSchema>;
