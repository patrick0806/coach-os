import { Injectable, NotFoundException } from "@nestjs/common";

import { PlansRepository } from "@shared/repositories/plans.repository";

@Injectable()
export class TogglePlanStatusService {
  constructor(private readonly plansRepository: PlansRepository) {}

  async execute(id: string, isActive: boolean): Promise<void> {
    const plan = await this.plansRepository.findById(id);
    if (!plan) {
      throw new NotFoundException("Plano não encontrado");
    }
    await this.plansRepository.updateStatus(id, isActive);
  }
}
