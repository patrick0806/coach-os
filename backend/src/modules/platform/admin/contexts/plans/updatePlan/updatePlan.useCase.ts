import { Injectable, NotFoundException } from "@nestjs/common";

import { PlansRepository } from "@shared/repositories/plans.repository";
import { validate } from "@shared/utils/validation.util";

import { updatePlanSchema } from "./dtos/request.dto";

@Injectable()
export class UpdatePlanUseCase {
  constructor(private readonly plansRepository: PlansRepository) { }

  async execute(id: string, body: unknown) {
    const data = validate(updatePlanSchema, body);

    const updated = await this.plansRepository.update(id, data);
    if (!updated) {
      throw new NotFoundException("Plano não encontrado");
    }

    return updated;
  }
}
