import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { StripeProvider } from "@shared/providers/stripe.provider";
import { IAccessToken } from "@shared/interfaces";

@Injectable()
export class CancelSubscriptionService {
  constructor(
    private readonly personalsRepository: PersonalsRepository,
    private readonly stripeProvider: StripeProvider,
  ) {}

  async execute(currentUser: IAccessToken): Promise<void> {
    if (!this.stripeProvider.isConfigured()) {
      throw new BadRequestException("Integração com Stripe não está configurada");
    }

    const personal = await this.personalsRepository.findById(currentUser.personalId as string);
    if (!personal) {
      throw new NotFoundException("Personal não encontrado");
    }

    if (!personal.stripeSubscriptionId || !personal.subscriptionStatus) {
      throw new BadRequestException("Nenhuma assinatura ativa encontrada");
    }

    if (personal.subscriptionStatus === "canceled") {
      throw new BadRequestException("A assinatura já está cancelada");
    }

    await this.stripeProvider.client!.subscriptions.update(personal.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
  }
}
