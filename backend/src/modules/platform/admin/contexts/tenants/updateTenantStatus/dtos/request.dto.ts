import { z } from "zod";

export const updateTenantStatusSchema = z.object({
  accessStatus: z.enum(["active", "suspended", "trialing", "expired", "past_due"]),
});

export type UpdateTenantStatusRequestDTO = z.infer<typeof updateTenantStatusSchema>;
