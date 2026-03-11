import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type Stripe from "stripe";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { StripeProvider } from "@shared/providers/stripe.provider";
import { IAccessToken } from "@shared/interfaces";

@Injectable()
export class SyncCheckoutService {
  constructor(
    private readonly personalsRepository: PersonalsRepository,
    private readonly stripeProvider: StripeProvider,
  ) {}

  async execute(sessionId: string, currentUser: IAccessToken): Promise<void> {
    if (!this.stripeProvider.isConfigured()) {
      throw new BadRequestException("Integração com Stripe não está configurada");
    }

    const stripe = this.stripeProvider.client!;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid" || session.status !== "complete") {
      throw new BadRequestException("Sessão de checkout não foi concluída com sucesso");
    }

    const personal = await this.personalsRepository.findById(currentUser.personalId as string);
    if (!personal) {
      throw new NotFoundException("Personal não encontrado");
    }

    // Ensure the session belongs to this personal's Stripe customer
    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : (session.customer as Stripe.Customer | null)?.id ?? null;

    if (!customerId || customerId !== personal.stripeCustomerId) {
      throw new BadRequestException("Sessão de checkout inválida");
    }

    await this.personalsRepository.updateSubscription(personal.id, {
      stripeSubscriptionId: session.subscription as string,
      subscriptionStatus: "active",
      subscriptionPlanId: session.metadata?.planId ?? null,
      accessStatus: "active",
      subscriptionExpiresAt: null,
    });
  }
}
