import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { ServicePlansRepository, ServicePlan } from "@shared/repositories/servicePlans.repository";
import { validate } from "@shared/utils/validation.util";

const updateServicePlanSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  description: z.string().max(1000).optional(),
  price: z.number().positive().optional(),
  sessionsPerWeek: z.number().int().positive().optional(),
  durationMinutes: z.number().int().positive().optional(),
  attendanceType: z.enum(["online", "presential"]).optional(),
  isActive: z.boolean().optional(),
});

@Injectable()
export class UpdateServicePlanUseCase {
  constructor(private readonly servicePlansRepository: ServicePlansRepository) {}

  async execute(id: string, body: unknown, tenantId: string): Promise<ServicePlan> {
    const data = validate(updateServicePlanSchema, body);

    const existing = await this.servicePlansRepository.findById(id, tenantId);
    if (!existing) {
      throw new NotFoundException("Service plan not found");
    }

    const updated = await this.servicePlansRepository.update(id, tenantId, {
      ...data,
      price: data.price !== undefined ? String(data.price) : undefined,
    });

    return updated!;
  }
}
