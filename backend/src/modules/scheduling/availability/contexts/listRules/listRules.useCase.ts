import { Injectable } from "@nestjs/common";

import {
  AvailabilityRulesRepository,
  AvailabilityRule,
} from "@shared/repositories/availabilityRules.repository";

@Injectable()
export class ListAvailabilityRulesUseCase {
  constructor(
    private readonly availabilityRulesRepository: AvailabilityRulesRepository,
  ) {}

  async execute(tenantId: string): Promise<AvailabilityRule[]> {
    return this.availabilityRulesRepository.findByTenantId(tenantId);
  }
}
