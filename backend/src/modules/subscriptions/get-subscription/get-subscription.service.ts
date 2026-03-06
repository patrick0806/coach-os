import { Injectable, NotFoundException } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { IAccessToken } from "@shared/interfaces";

import { SubscriptionStatusDTO } from "./dtos/response.dto";

@Injectable()
export class GetSubscriptionService {
  constructor(
    private readonly personalsRepository: PersonalsRepository,
    private readonly plansRepository: PlansRepository,
  ) {}

  async execute(currentUser: IAccessToken): Promise<SubscriptionStatusDTO> {
    const personal = await this.personalsRepository.findById(currentUser.personalId as string);
    if (!personal) {
      throw new NotFoundException("Personal não encontrado");
    }

    if (!personal.subscriptionPlanId) {
      return { status: null, plan: null, expiresAt: null };
    }

    const plan = await this.plansRepository.findById(personal.subscriptionPlanId);

    return {
      status: personal.subscriptionStatus ?? null,
      plan: plan
        ? { id: plan.id, name: plan.name, price: plan.price, benefits: plan.benefits }
        : null,
      expiresAt: personal.subscriptionExpiresAt ?? null,
    };
  }
}
