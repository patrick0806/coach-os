import { Injectable, NotFoundException } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { UsersRepository } from "@shared/repositories/users.repository";

import { TenantDetailDTO } from "./dtos/response.dto";

@Injectable()
export class GetTenantUseCase {
  constructor(
    private readonly personalsRepository: PersonalsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(id: string): Promise<TenantDetailDTO> {
    const personal = await this.personalsRepository.findById(id);
    if (!personal) {
      throw new NotFoundException("Tenant not found");
    }

    const user = await this.usersRepository.findById(personal.userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return {
      id: personal.id,
      name: user.name,
      email: user.email,
      slug: personal.slug,
      accessStatus: personal.accessStatus,
      subscriptionPlanId: personal.subscriptionPlanId ?? null,
      subscriptionStatus: personal.subscriptionStatus ?? null,
      isWhitelisted: personal.isWhitelisted,
      onboardingCompleted: personal.onboardingCompleted,
      stripeCustomerId: personal.stripeCustomerId ?? null,
      stripeSubscriptionId: personal.stripeSubscriptionId ?? null,
      subscriptionExpiresAt: personal.subscriptionExpiresAt?.toISOString() ?? null,
      trialEndsAt: personal.trialEndsAt?.toISOString() ?? null,
      createdAt: personal.createdAt,
    };
  }
}
