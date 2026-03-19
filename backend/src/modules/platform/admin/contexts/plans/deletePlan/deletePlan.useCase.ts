import { Injectable } from "@nestjs/common";

import { PlansRepository } from "@shared/repositories/plans.repository";

@Injectable()
export class DeletePlanUseCase {
  constructor(private readonly plansRepository: PlansRepository) {}

  async execute(id: string): Promise<void> {
    await this.plansRepository.deleteById(id);
  }
}
