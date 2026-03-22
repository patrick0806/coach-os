import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { StripeProvider } from "@shared/providers/stripe.provider";
import { ResendProvider } from "@shared/providers/resend.provider";
import { validate } from "@shared/utils/validation.util";

import { changePlanSchema } from "./dtos/request.dto";

@Injectable()
export class ChangePlanUseCase {
  constructor(
    private readonly personalsRepository: PersonalsRepository,
    private readonly plansRepository: PlansRepository,
    private readonly studentsRepository: StudentsRepository,
    private readonly stripeProvider: StripeProvider,
    private readonly usersRepository: UsersRepository,
    private readonly resendProvider: ResendProvider,
  ) {}

  async execute(personalId: string, body: unknown): Promise<void> {
    const { planId } = validate(changePlanSchema, body);

    const [personal, newPlan] = await Promise.all([
      this.personalsRepository.findById(personalId),
      this.plansRepository.findById(planId),
    ]);

    if (!personal) {
      throw new NotFoundException("Personal not found");
    }

    if (!newPlan) {
      throw new NotFoundException("Plan not found");
    }

    if (!newPlan.stripePriceId) {
      throw new BadRequestException("Selected plan is not available for purchase");
    }

    // CHK-009: Validate student limit on downgrade
    const activeStudents = await this.studentsRepository.countByTenantId(personalId);
    if (activeStudents > newPlan.maxStudents) {
      throw new BadRequestException(
        `Cannot downgrade: you have ${activeStudents} active students but the new plan allows only ${newPlan.maxStudents}`,
      );
    }

    // CHK-012: Update local plan FIRST, then Stripe
    // If Stripe fails, coach keeps old price but sees new plan — safer than reverse
    await this.personalsRepository.updateSubscription(personal.id, {
      subscriptionPlanId: newPlan.id,
    });

    // Update Stripe subscription if configured
    if (this.stripeProvider.isConfigured() && personal.stripeSubscriptionId) {
      const subscription = await this.stripeProvider.client!.subscriptions.retrieve(
        personal.stripeSubscriptionId,
        { expand: ["items"] },
      );

      const itemId = subscription.items.data[0]?.id;

      if (!itemId) {
        // Rollback local plan change
        await this.personalsRepository.updateSubscription(personal.id, {
          subscriptionPlanId: personal.subscriptionPlanId,
        });
        throw new BadRequestException("No subscription item found");
      }

      try {
        await this.stripeProvider.client!.subscriptions.update(personal.stripeSubscriptionId, {
          items: [{ id: itemId, price: newPlan.stripePriceId }],
          proration_behavior: "always_invoice",
        });
      } catch (error) {
        // Rollback local plan change on Stripe failure
        await this.personalsRepository.updateSubscription(personal.id, {
          subscriptionPlanId: personal.subscriptionPlanId,
        });
        throw error;
      }
    }

    // Fire-and-forget plan changed email — failure must not block the response
    const user = await this.usersRepository.findById(personal.userId);
    if (user) {
      this.resendProvider.sendPlanChanged({
        to: user.email,
        userName: user.name,
        newPlanName: newPlan.name,
      });
    }
  }
}
