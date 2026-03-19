import { BadRequestException, Injectable } from "@nestjs/common";
import Stripe from "stripe";

import { env } from "@config/env";
import { logger } from "@config/pino.config";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { StripeProvider } from "@shared/providers/stripe.provider";

function resolveAccessStatus(
  stripeStatus: string,
): "active" | "trialing" | "past_due" | "expired" | "suspended" {
  switch (stripeStatus) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
    case "unpaid":
      return "expired";
    default:
      return "expired";
  }
}

@Injectable()
export class ProcessStripeEventUseCase {
  constructor(
    private readonly stripeProvider: StripeProvider,
    private readonly personalsRepository: PersonalsRepository,
    private readonly plansRepository: PlansRepository,
  ) {}

  async execute(rawBody: Buffer, signature: string): Promise<void> {
    if (!this.stripeProvider.isConfigured()) {
      logger.warn("Stripe webhook received but Stripe is not configured");
      return;
    }

    const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new BadRequestException("Stripe webhook secret not configured");
    }

    let event: Stripe.Event;
    try {
      event = this.stripeProvider.client!.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Webhook signature verification failed";
      throw new BadRequestException(`Webhook signature verification failed: ${message}`);
    }

    logger.info({ type: event.type }, "Stripe webhook received");

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.paid":
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        logger.info({ type: event.type }, "Unhandled Stripe event type");
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string;
    const personal = await this.personalsRepository.findByStripeCustomerId(customerId);

    if (!personal) {
      logger.warn({ customerId }, "Personal not found for Stripe customer");
      return;
    }

    const priceId = subscription.items.data[0]?.price?.id;
    let subscriptionPlanId: string | undefined;

    if (priceId) {
      const plan = await this.plansRepository.findByStripePriceId(priceId);
      subscriptionPlanId = plan?.id;
    }

    const accessStatus = resolveAccessStatus(subscription.status);

    // Use cancel_at as subscriptionExpiresAt when cancellation is scheduled
    // For active subscriptions, period_end is tracked via invoice.paid webhook
    const subscriptionExpiresAt = subscription.cancel_at
      ? new Date(subscription.cancel_at * 1000)
      : undefined;

    await this.personalsRepository.updateSubscription(personal.id, {
      subscriptionStatus: subscription.status,
      accessStatus,
      ...(subscriptionExpiresAt ? { subscriptionExpiresAt } : {}),
      stripeSubscriptionId: subscription.id,
      ...(subscriptionPlanId ? { subscriptionPlanId } : {}),
    });

    logger.info({ personalId: personal.id, status: subscription.status }, "Subscription updated");
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string;
    const personal = await this.personalsRepository.findByStripeCustomerId(customerId);

    if (!personal) {
      logger.warn({ customerId }, "Personal not found for Stripe customer");
      return;
    }

    await this.personalsRepository.updateSubscription(personal.id, {
      subscriptionStatus: "canceled",
      accessStatus: "expired",
    });

    logger.info({ personalId: personal.id }, "Subscription deleted");
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;
    const personal = await this.personalsRepository.findByStripeCustomerId(customerId);

    if (!personal) {
      logger.warn({ customerId }, "Personal not found for Stripe customer");
      return;
    }

    // Skip trial invoices (amount = $0) to avoid overriding "trialing" status
    if (invoice.amount_paid === 0) {
      logger.info({ personalId: personal.id }, "Trial invoice paid — skipping access status update");
      return;
    }

    // The invoice period_end represents the end of the service period billed
    const periodEnd = invoice.period_end;
    const subscriptionExpiresAt = periodEnd ? new Date(periodEnd * 1000) : undefined;

    await this.personalsRepository.updateSubscription(personal.id, {
      accessStatus: "active",
      ...(subscriptionExpiresAt ? { subscriptionExpiresAt } : {}),
    });

    logger.info({ personalId: personal.id }, "Invoice paid — access confirmed active");
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;
    const personal = await this.personalsRepository.findByStripeCustomerId(customerId);

    if (!personal) {
      logger.warn({ customerId }, "Personal not found for Stripe customer");
      return;
    }

    await this.personalsRepository.updateSubscription(personal.id, {
      accessStatus: "past_due",
      subscriptionStatus: "past_due",
    });

    logger.info({ personalId: personal.id }, "Invoice payment failed — access set to past_due");
  }
}
