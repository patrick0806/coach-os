import { Injectable } from "@nestjs/common";

import { PlansRepository } from "@shared/repositories/plans.repository";
import { Plans } from "@config/database/schema/plans";

@Injectable()
export class ListPlansService {
  constructor(private readonly plansRepository: PlansRepository) {}

  async execute(): Promise<Plans[]> {
    return this.plansRepository.findAllActive();
  }
}
