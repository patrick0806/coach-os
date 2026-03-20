import { Injectable, NotFoundException } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { StripeProvider } from "@shared/providers/stripe.provider";
import { ResendProvider } from "@shared/providers/resend.provider";

export interface CancelSubscriptionResult {
  subscriptionExpiresAt: string | null;
}

@Injectable()
export class CancelSubscriptionUseCase {
  constructor(
    private readonly personalsRepository: PersonalsRepository,
    private readonly stripeProvider: StripeProvider,
    private readonly usersRepository: UsersRepository,
    private readonly resendProvider: ResendProvider,
  ) {}

  async execute(personalId: string): Promise<CancelSubscriptionResult> {
    const personal = await this.personalsRepository.findById(personalId);

    if (!personal) {
      throw new NotFoundException("Personal not found");
    }

    let subscriptionExpiresAt: string | null = personal.subscriptionExpiresAt?.toISOString() ?? null;

    if (this.stripeProvider.isConfigured() && personal.stripeSubscriptionId) {
      const subscription = await this.stripeProvider.client!.subscriptions.update(
        personal.stripeSubscriptionId,
        { cancel_at_period_end: true },
      );

      // When cancel_at_period_end is true, Stripe sets cancel_at to the end of the billing period
      if (subscription.cancel_at) {
        subscriptionExpiresAt = new Date(subscription.cancel_at * 1000).toISOString();
        await this.personalsRepository.updateSubscription(personal.id, {
          subscriptionExpiresAt: new Date(subscription.cancel_at * 1000),
        });
      }
    }

    // Fire-and-forget cancellation email — failure must not block the response
    const user = await this.usersRepository.findById(personal.userId);
    if (user) {
      this.resendProvider.sendPlanCancelled({
        to: user.email,
        userName: user.name,
        expiresAt: subscriptionExpiresAt ?? undefined,
      });
    }

    return { subscriptionExpiresAt };
  }
}
