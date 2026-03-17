import { Injectable, NotFoundException } from "@nestjs/common";

import { ServicePlansRepository, ServicePlan } from "@shared/repositories/servicePlans.repository";

@Injectable()
export class GetServicePlanUseCase {
  constructor(private readonly servicePlansRepository: ServicePlansRepository) {}

  async execute(id: string, tenantId: string): Promise<ServicePlan> {
    const plan = await this.servicePlansRepository.findById(id, tenantId);

    if (!plan) {
      throw new NotFoundException("Service plan not found");
    }

    return plan;
  }
}
