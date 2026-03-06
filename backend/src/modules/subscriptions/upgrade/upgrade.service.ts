import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { StripeProvider } from "@shared/providers/stripe.provider";
import { IAccessToken } from "@shared/interfaces";

// Read process.env directly so tests can stub values with vi.stubEnv
function getPriceId(planName: string): string | null {
  const map: Record<string, string | undefined> = {
    Basico: process.env.STRIPE_PRICE_BASICO,
    Pro: process.env.STRIPE_PRICE_PRO,
    Empresarial: process.env.STRIPE_PRICE_EMPRESARIAL,
  };
  return map[planName] || null;
}

@Injectable()
export class UpgradeService {
  constructor(
    private readonly personalsRepository: PersonalsRepository,
    private readonly plansRepository: PlansRepository,
    private readonly stripeProvider: StripeProvider,
  ) {}

  async execute(planId: string, currentUser: IAccessToken): Promise<void> {
    if (!this.stripeProvider.isConfigured()) {
      throw new BadRequestException("Integração com Stripe não está configurada");
    }

    const personal = await this.personalsRepository.findById(currentUser.personalId as string);
    if (!personal) {
      throw new NotFoundException("Personal não encontrado");
    }

    if (!personal.stripeSubscriptionId || personal.subscriptionStatus === "canceled") {
      throw new BadRequestException("Nenhuma assinatura ativa encontrada");
    }

    const currentPlan = personal.subscriptionPlanId
      ? await this.plansRepository.findById(personal.subscriptionPlanId)
      : null;

    const targetPlan = await this.plansRepository.findById(planId);
    if (!targetPlan || !targetPlan.isActive) {
      throw new NotFoundException("Plano de destino não encontrado ou inativo");
    }

    const currentOrder = currentPlan?.order ?? -1;
    if (targetPlan.order <= currentOrder) {
      throw new BadRequestException(
        "O plano de destino deve ser de uma categoria superior ao plano atual",
      );
    }

    const priceId = getPriceId(targetPlan.name);
    if (!priceId) {
      throw new BadRequestException(
        `Plano "${targetPlan.name}" não possui um Stripe Price ID mapeado`,
      );
    }

    const stripe = this.stripeProvider.client!;
    const subscription = await stripe.subscriptions.retrieve(personal.stripeSubscriptionId);
    const itemId = subscription.items.data[0]?.id;

    await stripe.subscriptions.update(personal.stripeSubscriptionId, {
      items: [{ id: itemId, price: priceId }],
      proration_behavior: "always_invoice",
    });

    await this.personalsRepository.updateSubscription(personal.id, {
      subscriptionPlanId: targetPlan.id,
    });
  }
}
