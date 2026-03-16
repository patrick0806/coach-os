import { Injectable } from "@nestjs/common";

import { PlansRepository } from "@shared/repositories/plans.repository";
import { ListPlansResponseDTO } from "./dtos/response.dto";

@Injectable()
export class ListPlansUseCase {
  constructor(private readonly plansRepository: PlansRepository) {}

  async execute(): Promise<ListPlansResponseDTO[]> {
    const plans = await this.plansRepository.findAll();

    return plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      maxStudents: plan.maxStudents,
      benefits: plan.benefits,
      highlighted: plan.highlighted ?? false,
      order: plan.order ?? 0,
    }));
  }
}
