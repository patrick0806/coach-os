import { Module } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { StripeProvider } from "@shared/providers/stripe.provider";

import { CheckoutController } from "./checkout/checkout.controller";
import { CheckoutService } from "./checkout/checkout.service";
import { WebhookController } from "./webhook/webhook.controller";
import { WebhookService } from "./webhook/webhook.service";
import { GetSubscriptionController } from "./get-subscription/get-subscription.controller";
import { GetSubscriptionService } from "./get-subscription/get-subscription.service";
import { CancelSubscriptionController } from "./cancel-subscription/cancel-subscription.controller";
import { CancelSubscriptionService } from "./cancel-subscription/cancel-subscription.service";
import { UsageController } from "./usage/usage.controller";
import { UsageService } from "./usage/usage.service";
import { PortalController } from "./portal/portal.controller";
import { PortalService } from "./portal/portal.service";
import { UpgradeController } from "./upgrade/upgrade.controller";
import { UpgradeService } from "./upgrade/upgrade.service";
import { SyncCheckoutController } from "./sync-checkout/sync-checkout.controller";
import { SyncCheckoutService } from "./sync-checkout/sync-checkout.service";

@Module({
  controllers: [
    CheckoutController,
    WebhookController,
    GetSubscriptionController,
    CancelSubscriptionController,
    UsageController,
    PortalController,
    UpgradeController,
    SyncCheckoutController,
  ],
  providers: [
    CheckoutService,
    WebhookService,
    GetSubscriptionService,
    CancelSubscriptionService,
    UsageService,
    PortalService,
    UpgradeService,
    SyncCheckoutService,
    PersonalsRepository,
    PlansRepository,
    StudentsRepository,
    UsersRepository,
    StripeProvider,
  ],
})
export class SubscriptionsModule {}
