import { Injectable, NotFoundException } from "@nestjs/common";

import { ServicePlansRepository } from "@shared/repositories/servicePlans.repository";

@Injectable()
export class DeleteServicePlanUseCase {
  constructor(private readonly servicePlansRepository: ServicePlansRepository) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const existing = await this.servicePlansRepository.findById(id, tenantId);

    if (!existing) {
      throw new NotFoundException("Service plan not found");
    }

    await this.servicePlansRepository.delete(id, tenantId);
  }
}
