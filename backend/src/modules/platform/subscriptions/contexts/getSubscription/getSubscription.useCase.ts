import { Injectable, NotFoundException } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";

import { GetSubscriptionResponseDTO } from "./dtos/response.dto";

@Injectable()
export class GetSubscriptionUseCase {
  constructor(
    private readonly personalsRepository: PersonalsRepository,
    private readonly plansRepository: PlansRepository,
    private readonly studentsRepository: StudentsRepository,
  ) {}

  async execute(personalId: string): Promise<GetSubscriptionResponseDTO> {
    const personal = await this.personalsRepository.findById(personalId);

    if (!personal) {
      throw new NotFoundException("Personal not found");
    }

    const [studentsCount, plan] = await Promise.all([
      this.studentsRepository.countByTenantId(personalId),
      personal.subscriptionPlanId
        ? this.plansRepository.findById(personal.subscriptionPlanId)
        : Promise.resolve(undefined),
    ]);

    return {
      plan: plan
        ? {
            id: plan.id,
            name: plan.name,
            price: plan.price,
            maxStudents: plan.maxStudents,
            highlighted: plan.highlighted ?? false,
          }
        : null,
      accessStatus: personal.accessStatus,
      subscriptionStatus: personal.subscriptionStatus ?? null,
      trialEndsAt: personal.trialEndsAt?.toISOString() ?? null,
      subscriptionExpiresAt: personal.subscriptionExpiresAt?.toISOString() ?? null,
      studentsCount,
      studentsLimit: plan?.maxStudents ?? 0,
      isWhitelisted: personal.isWhitelisted,
    };
  }
}
