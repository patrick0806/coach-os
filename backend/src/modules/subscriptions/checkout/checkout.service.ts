import { BadRequestException, Injectable } from "@nestjs/common";

import { PlansRepository } from "@shared/repositories/plans.repository";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { StripeProvider } from "@shared/providers/stripe.provider";
import { IAccessToken } from "@shared/interfaces";
import { env } from "@config/env";

export interface CheckoutResult {
  checkoutUrl: string;
}

@Injectable()
export class CheckoutService {
  constructor(
    private readonly plansRepository: PlansRepository,
    private readonly personalsRepository: PersonalsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly stripeProvider: StripeProvider,
  ) {}

  async execute(planId: string, currentUser: IAccessToken): Promise<CheckoutResult> {
    if (!this.stripeProvider.isConfigured()) {
      throw new BadRequestException("Integração com Stripe não está configurada");
    }

    const stripe = this.stripeProvider.client!;

    const plan = await this.plansRepository.findById(planId);
    if (!plan || !plan.isActive) {
      throw new BadRequestException("Plano não encontrado ou inativo");
    }

    const priceId = plan.stripePriceId;
    if (!priceId) {
      throw new BadRequestException(
        `Plano "${plan.name}" não possui um Stripe Price ID configurado.`,
      );
    }

    const personal = await this.personalsRepository.findById(currentUser.personalId as string);
    if (!personal) {
      throw new BadRequestException("Personal não encontrado");
    }

    // Create or reuse Stripe Customer
    let customerId = personal.stripeCustomerId;
    if (!customerId) {
      const user = await this.usersRepository.findById(currentUser.sub);
      const customer = await stripe.customers.create({
        email: user?.email ?? undefined,
        metadata: { personalId: personal.id },
      });
      customerId = customer.id;
      await this.personalsRepository.updateSubscription(personal.id, { stripeCustomerId: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${env.APP_URL}/painel/assinatura/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.APP_URL}/painel/assinatura/cancelado`,
      metadata: { planId: plan.id },
    });

    return { checkoutUrl: session.url! };
  }
}
