import { Module } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { WebhookEventsRepository } from "@shared/repositories/webhookEvents.repository";
import { StripeProvider } from "@shared/providers/stripe.provider";
import { ResendProvider } from "@shared/providers/resend.provider";

import { StripeWebhookController } from "./contexts/stripe/stripeWebhook.controller";
import { ProcessStripeEventUseCase } from "./contexts/stripe/processStripeEvent.useCase";

@Module({
  controllers: [StripeWebhookController],
  providers: [
    StripeProvider,
    ResendProvider,
    PersonalsRepository,
    PlansRepository,
    UsersRepository,
    WebhookEventsRepository,
    ProcessStripeEventUseCase,
  ],
})
export class WebhooksModule {}
