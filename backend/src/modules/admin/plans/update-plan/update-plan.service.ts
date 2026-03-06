import { Injectable, NotFoundException } from "@nestjs/common";

import { PlansRepository } from "@shared/repositories/plans.repository";
import { Plans } from "@config/database/schema/plans";

import { UpdatePlanInput } from "./dtos/request.dto";

@Injectable()
export class UpdatePlanService {
  constructor(private readonly plansRepository: PlansRepository) {}

  async execute(id: string, data: UpdatePlanInput): Promise<Plans> {
    const plan = await this.plansRepository.findById(id);
    if (!plan) {
      throw new NotFoundException("Plano não encontrado");
    }
    return this.plansRepository.update(id, data);
  }
}
