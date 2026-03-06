import { Injectable } from "@nestjs/common";

import { PlansRepository } from "@shared/repositories/plans.repository";
import { Plans } from "@config/database/schema/plans";

import { CreatePlanInput } from "./dtos/request.dto";

@Injectable()
export class CreatePlanService {
  constructor(private readonly plansRepository: PlansRepository) {}

  execute(data: CreatePlanInput): Promise<Plans> {
    return this.plansRepository.create(data);
  }
}
