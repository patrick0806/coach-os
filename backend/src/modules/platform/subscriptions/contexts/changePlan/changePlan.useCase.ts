import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { StripeProvider } from "@shared/providers/stripe.provider";
import { validate } from "@shared/utils/validation.util";

import { changePlanSchema } from "./dtos/request.dto";

@Injectable()
export class ChangePlanUseCase {
  constructor(
    private readonly personalsRepository: PersonalsRepository,
    private readonly plansRepository: PlansRepository,
    private readonly stripeProvider: StripeProvider,
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

    // Update Stripe subscription if configured
    if (this.stripeProvider.isConfigured() && personal.stripeSubscriptionId) {
      const subscription = await this.stripeProvider.client!.subscriptions.retrieve(
        personal.stripeSubscriptionId,
        { expand: ["items"] },
      );

      const itemId = subscription.items.data[0]?.id;

      if (!itemId) {
        throw new BadRequestException("No subscription item found");
      }

      await this.stripeProvider.client!.subscriptions.update(personal.stripeSubscriptionId, {
        items: [{ id: itemId, price: newPlan.stripePriceId }],
        proration_behavior: "always_invoice",
      });
    }

    // Update local plan reference
    await this.personalsRepository.updateSubscription(personal.id, {
      subscriptionPlanId: newPlan.id,
    });
  }
}
