import { Injectable } from "@nestjs/common";

import { PlansRepository, ReorderItem } from "@shared/repositories/plans.repository";

@Injectable()
export class ReorderPlansService {
  constructor(private readonly plansRepository: PlansRepository) {}

  execute(items: ReorderItem[]): Promise<void> {
    return this.plansRepository.updateOrder(items);
  }
}
