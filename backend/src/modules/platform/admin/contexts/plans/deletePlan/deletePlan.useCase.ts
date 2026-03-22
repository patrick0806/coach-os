import { BadRequestException, Injectable } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";

@Injectable()
export class DeletePlanUseCase {
  constructor(
    private readonly plansRepository: PlansRepository,
    private readonly personalsRepository: PersonalsRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const activeCoaches = await this.personalsRepository.countBySubscriptionPlanId(id);
    if (activeCoaches > 0) {
      throw new BadRequestException(
        `Cannot deactivate plan: ${activeCoaches} active coach(es) are using it`,
      );
    }

    await this.plansRepository.deleteById(id);
  }
}
