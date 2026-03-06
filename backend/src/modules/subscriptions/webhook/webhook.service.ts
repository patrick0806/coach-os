import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import Stripe from "stripe";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { StripeProvider } from "@shared/providers/stripe.provider";
import { env } from "@config/env";

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly personalsRepository: PersonalsRepository,
    private readonly plansRepository: PlansRepository,
    private readonly stripeProvider: StripeProvider,
  ) {}

  async execute(rawBody: Buffer, signature: string): Promise<void> {
    const stripe = this.stripeProvider.client!;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch {
      throw new BadRequestException("Assinatura do webhook inválida");
    }

    switch (event.type) {
      case "checkout.session.completed":
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        this.logger.debug(`Unhandled Stripe event: ${event.type}`);
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const customerId = session.customer as string;
    const personal = await this.personalsRepository.findByStripeCustomerId(customerId);
    if (!personal) {
      this.logger.warn(`No personal found for Stripe customer ${customerId}`);
      return;
    }

    await this.personalsRepository.updateSubscription(personal.id, {
      stripeSubscriptionId: session.subscription as string,
      subscriptionStatus: "active",
      subscriptionPlanId: (session.metadata?.planId) ?? null,
    });
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string;
    const personal = await this.personalsRepository.findByStripeCustomerId(customerId);
    if (!personal) return;

    // cancel_at is set when cancel_at_period_end = true — use it as the expiration date
    const expiresAt = subscription.cancel_at
      ? new Date(subscription.cancel_at * 1000)
      : null;

    await this.personalsRepository.updateSubscription(personal.id, {
      subscriptionStatus: subscription.status,
      subscriptionExpiresAt: expiresAt,
    });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string;
    const personal = await this.personalsRepository.findByStripeCustomerId(customerId);
    if (!personal) return;

    await this.personalsRepository.updateSubscription(personal.id, {
      subscriptionStatus: "canceled",
      stripeSubscriptionId: null,
      subscriptionExpiresAt: null,
    });
  }
}
