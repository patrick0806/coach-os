import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { env } from "@config/env";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { StripeProvider } from "@shared/providers/stripe.provider";

export interface CreateCheckoutSessionResult {
  url: string;
}

@Injectable()
export class CreateCheckoutSessionUseCase {
  constructor(
    private readonly personalsRepository: PersonalsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly plansRepository: PlansRepository,
    private readonly stripeProvider: StripeProvider,
  ) {}

  async execute(personalId: string): Promise<CreateCheckoutSessionResult> {
    if (!this.stripeProvider.isConfigured()) {
      throw new BadRequestException("Stripe is not configured");
    }

    const personal = await this.personalsRepository.findById(personalId);
    if (!personal) {
      throw new NotFoundException("Personal not found");
    }

    // Resolve the plan and its Stripe price
    const planId = personal.subscriptionPlanId;
    if (!planId) {
      throw new BadRequestException("No plan associated with this account");
    }

    const plan = await this.plansRepository.findById(planId);
    if (!plan?.stripePriceId) {
      throw new BadRequestException("Plan has no Stripe price configured");
    }

    // Ensure Stripe customer exists (lazy creation for accounts registered before Stripe was configured)
    let stripeCustomerId = personal.stripeCustomerId;
    if (!stripeCustomerId) {
      const user = await this.usersRepository.findById(personal.userId);
      if (!user) {
        throw new NotFoundException("User not found");
      }

      const customer = await this.stripeProvider.client!.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });

      stripeCustomerId = customer.id;
      await this.personalsRepository.updateSubscription(personal.id, { stripeCustomerId });
    }

    // Cancel existing trial subscription to avoid duplicates
    if (personal.stripeSubscriptionId && personal.subscriptionStatus === "trialing") {
      await this.stripeProvider.client!.subscriptions.cancel(personal.stripeSubscriptionId);
    }

    const successUrl = `${env.APP_URL}/assinatura?checkout=success`;
    const cancelUrl = `${env.APP_URL}/assinatura`;

    const session = await this.stripeProvider.client!.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return { url: session.url! };
  }
}
