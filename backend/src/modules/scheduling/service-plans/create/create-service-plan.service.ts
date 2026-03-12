import { BadRequestException, Injectable } from "@nestjs/common";

import { ServicePlansRepository } from "@shared/repositories/service-plans.repository";
import { IAccessToken } from "@shared/interfaces";
import { ServicePlan } from "@config/database/schema/availability";

import { CreateServicePlanSchema, CreateServicePlanInput } from "./dtos/request.dto";

@Injectable()
export class CreateServicePlanService {
  constructor(private readonly servicePlansRepository: ServicePlansRepository) {}

  async execute(dto: CreateServicePlanInput, currentUser: IAccessToken): Promise<ServicePlan> {
    const parsed = CreateServicePlanSchema.safeParse(dto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0].message);
    }

    return this.servicePlansRepository.create({
      personalId: currentUser.personalId as string,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      sessionsPerWeek: parsed.data.sessionsPerWeek,
      durationMinutes: parsed.data.durationMinutes,
      // Convert number to string for numeric DB column
      price: parsed.data.price.toFixed(2),
      attendanceType: parsed.data.attendanceType,
    });
  }
}
