import { BadRequestException, Injectable } from "@nestjs/common";

import { PlansRepository } from "@shared/repositories/plans.repository";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { StripeProvider } from "@shared/providers/stripe.provider";
import { IAccessToken } from "@shared/interfaces";
import { env } from "@config/env";

// Read process.env directly (at call time) so tests can stub values with vi.stubEnv
// without being affected by the already-cached `env` object
function getPriceId(planName: string): string | null {
  const map: Record<string, string | undefined> = {
    Basico: process.env.STRIPE_PRICE_BASICO,
    Pro: process.env.STRIPE_PRICE_PRO,
    Empresarial: process.env.STRIPE_PRICE_EMPRESARIAL,
  };
  return map[planName] || null;
}

export interface CheckoutResult {
  checkoutUrl: string;
}

@Injectable()
export class CheckoutService {
  constructor(
    private readonly plansRepository: PlansRepository,
    private readonly personalsRepository: PersonalsRepository,
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

    const priceId = getPriceId(plan.name);
    if (!priceId) {
      throw new BadRequestException(
        `Plano "${plan.name}" não possui um Stripe Price ID mapeado. Configure a variável de ambiente correspondente.`,
      );
    }

    const personal = await this.personalsRepository.findById(currentUser.personalId as string);
    if (!personal) {
      throw new BadRequestException("Personal não encontrado");
    }

    // Create or reuse Stripe Customer
    let customerId = personal.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: currentUser.sub,
        metadata: { personalId: personal.id },
      });
      customerId = customer.id;
      await this.personalsRepository.updateSubscription(personal.id, { stripeCustomerId: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${env.APP_URL}/dashboard/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.APP_URL}/dashboard/subscription/cancel`,
      metadata: { planId: plan.id },
    });

    return { checkoutUrl: session.url! };
  }
}
