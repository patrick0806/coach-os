import { Module } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { StripeProvider } from "@shared/providers/stripe.provider";

import { CheckoutController } from "./checkout/checkout.controller";
import { CheckoutService } from "./checkout/checkout.service";
import { WebhookController } from "./webhook/webhook.controller";
import { WebhookService } from "./webhook/webhook.service";
import { GetSubscriptionController } from "./get-subscription/get-subscription.controller";
import { GetSubscriptionService } from "./get-subscription/get-subscription.service";
import { CancelSubscriptionController } from "./cancel-subscription/cancel-subscription.controller";
import { CancelSubscriptionService } from "./cancel-subscription/cancel-subscription.service";

@Module({
  controllers: [
    CheckoutController,
    WebhookController,
    GetSubscriptionController,
    CancelSubscriptionController,
  ],
  providers: [
    CheckoutService,
    WebhookService,
    GetSubscriptionService,
    CancelSubscriptionService,
    PersonalsRepository,
    PlansRepository,
    StripeProvider,
  ],
})
export class SubscriptionsModule {}
