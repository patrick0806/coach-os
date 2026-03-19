import { Module } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { StripeProvider } from "@shared/providers/stripe.provider";

import { StripeWebhookController } from "./contexts/stripe/stripeWebhook.controller";
import { ProcessStripeEventUseCase } from "./contexts/stripe/processStripeEvent.useCase";

@Module({
  controllers: [StripeWebhookController],
  providers: [
    StripeProvider,
    PersonalsRepository,
    PlansRepository,
    ProcessStripeEventUseCase,
  ],
})
export class WebhooksModule {}
