import { Injectable, NotFoundException } from "@nestjs/common";

import { AvailabilityRulesRepository } from "@shared/repositories/availabilityRules.repository";

@Injectable()
export class DeleteAvailabilityRuleUseCase {
  constructor(
    private readonly availabilityRulesRepository: AvailabilityRulesRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const existing = await this.availabilityRulesRepository.findById(
      id,
      tenantId,
    );
    if (!existing) {
      throw new NotFoundException("Availability rule not found");
    }

    await this.availabilityRulesRepository.delete(id, tenantId);
  }
}
