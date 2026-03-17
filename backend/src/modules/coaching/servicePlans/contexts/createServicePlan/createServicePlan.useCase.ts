import { Injectable } from "@nestjs/common";
import { z } from "zod";

import { ServicePlansRepository, ServicePlan } from "@shared/repositories/servicePlans.repository";
import { validate } from "@shared/utils/validation.util";

const createServicePlanSchema = z.object({
  name: z.string().min(1).max(150),
  description: z.string().max(1000).optional(),
  price: z.number().positive(),
  sessionsPerWeek: z.number().int().positive().optional(),
  durationMinutes: z.number().int().positive().optional(),
  attendanceType: z.enum(["online", "presential"]),
});

@Injectable()
export class CreateServicePlanUseCase {
  constructor(private readonly servicePlansRepository: ServicePlansRepository) {}

  async execute(body: unknown, tenantId: string): Promise<ServicePlan> {
    const data = validate(createServicePlanSchema, body);

    return this.servicePlansRepository.create({
      tenantId,
      name: data.name,
      description: data.description ?? null,
      price: String(data.price),
      sessionsPerWeek: data.sessionsPerWeek ?? null,
      durationMinutes: data.durationMinutes ?? null,
      attendanceType: data.attendanceType,
    });
  }
}
