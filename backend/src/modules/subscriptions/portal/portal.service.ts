import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { StripeProvider } from "@shared/providers/stripe.provider";
import { IAccessToken } from "@shared/interfaces";
import { env } from "@config/env";

import { PortalDTO } from "./dtos/response.dto";

@Injectable()
export class PortalService {
  constructor(
    private readonly personalsRepository: PersonalsRepository,
    private readonly stripeProvider: StripeProvider,
  ) {}

  async execute(currentUser: IAccessToken): Promise<PortalDTO> {
    if (!this.stripeProvider.isConfigured()) {
      throw new BadRequestException("Integração com Stripe não está configurada");
    }

    const personal = await this.personalsRepository.findById(currentUser.personalId as string);
    if (!personal) {
      throw new NotFoundException("Personal não encontrado");
    }

    if (!personal.stripeCustomerId) {
      throw new BadRequestException("Personal não possui uma conta Stripe associada");
    }

    const stripe = this.stripeProvider.client!;
    const session = await stripe.billingPortal.sessions.create({
      customer: personal.stripeCustomerId,
      return_url: `${env.APP_URL}/dashboard/subscription`,
    });

    return { portalUrl: session.url };
  }
}
