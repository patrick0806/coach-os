import { Injectable } from "@nestjs/common";

import { PlansRepository } from "@shared/repositories/plans.repository";
import { validate } from "@shared/utils/validation.util";

import { createPlanSchema } from "./dtos/request.dto";

@Injectable()
export class CreatePlanUseCase {
  constructor(private readonly plansRepository: PlansRepository) {}

  async execute(body: unknown) {
    const data = validate(createPlanSchema, body);
    return this.plansRepository.create(data);
  }
}
