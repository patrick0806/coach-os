import { Injectable } from "@nestjs/common";

import { ServicePlansRepository, ServicePlan } from "@shared/repositories/servicePlans.repository";

@Injectable()
export class ListServicePlansUseCase {
  constructor(private readonly servicePlansRepository: ServicePlansRepository) {}

  async execute(tenantId: string): Promise<ServicePlan[]> {
    return this.servicePlansRepository.findByTenantId(tenantId);
  }
}
