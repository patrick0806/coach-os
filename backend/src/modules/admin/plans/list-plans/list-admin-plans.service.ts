import { Injectable } from "@nestjs/common";

import { PlansRepository } from "@shared/repositories/plans.repository";
import { Plans } from "@config/database/schema/plans";

@Injectable()
export class ListAdminPlansService {
  constructor(private readonly plansRepository: PlansRepository) {}

  execute(): Promise<Plans[]> {
    return this.plansRepository.findAll();
  }
}
