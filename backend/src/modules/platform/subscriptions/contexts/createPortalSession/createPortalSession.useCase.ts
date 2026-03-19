import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { env } from "@config/env";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { StripeProvider } from "@shared/providers/stripe.provider";

export interface CreatePortalSessionResult {
  url: string;
}

@Injectable()
export class CreatePortalSessionUseCase {
  constructor(
    private readonly personalsRepository: PersonalsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly stripeProvider: StripeProvider,
  ) {}

  async execute(personalId: string): Promise<CreatePortalSessionResult> {
    if (!this.stripeProvider.isConfigured()) {
      throw new BadRequestException("Stripe is not configured");
    }

    const personal = await this.personalsRepository.findById(personalId);

    if (!personal) {
      throw new NotFoundException("Personal not found");
    }

    let stripeCustomerId = personal.stripeCustomerId;

    // Lazily create Stripe customer if not present (e.g. registered before Stripe was configured)
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

    const returnUrl = `${env.APP_URL}/assinatura`;

    const session = await this.stripeProvider.client!.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  }
}
