import { Module } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { StripeProvider } from "@shared/providers/stripe.provider";
import { ResendProvider } from "@shared/providers/resend.provider";

import { GetSubscriptionController } from "./contexts/getSubscription/getSubscription.controller";
import { GetSubscriptionUseCase } from "./contexts/getSubscription/getSubscription.useCase";
import { ChangePlanController } from "./contexts/changePlan/changePlan.controller";
import { ChangePlanUseCase } from "./contexts/changePlan/changePlan.useCase";
import { CancelSubscriptionController } from "./contexts/cancelSubscription/cancelSubscription.controller";
import { CancelSubscriptionUseCase } from "./contexts/cancelSubscription/cancelSubscription.useCase";
import { CreatePortalSessionController } from "./contexts/createPortalSession/createPortalSession.controller";
import { CreatePortalSessionUseCase } from "./contexts/createPortalSession/createPortalSession.useCase";
import { CreateCheckoutSessionController } from "./contexts/createCheckoutSession/createCheckoutSession.controller";
import { CreateCheckoutSessionUseCase } from "./contexts/createCheckoutSession/createCheckoutSession.useCase";

@Module({
  controllers: [
    GetSubscriptionController,
    ChangePlanController,
    CancelSubscriptionController,
    CreatePortalSessionController,
    CreateCheckoutSessionController,
  ],
  providers: [
    StripeProvider,
    ResendProvider,
    PersonalsRepository,
    PlansRepository,
    StudentsRepository,
    UsersRepository,
    GetSubscriptionUseCase,
    ChangePlanUseCase,
    CancelSubscriptionUseCase,
    CreatePortalSessionUseCase,
    CreateCheckoutSessionUseCase,
  ],
})
export class SubscriptionsModule {}
