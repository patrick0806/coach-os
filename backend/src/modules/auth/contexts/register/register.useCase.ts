import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { addDays } from "date-fns";
import { z } from "zod";

import { env } from "@config/env";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { StripeProvider } from "@shared/providers/stripe.provider";
import { ResendProvider } from "@shared/providers/resend.provider";
import { generateUniqueSlug } from "@shared/utils/generateUniqueSlug.util";
import { generateSetupToken } from "@shared/utils/token.util";
import { validate } from "@shared/utils/validation.util";

const TRIAL_DAYS = 14;

const registerSchema = z.object({
  name: z.string().min(3).max(150),
  email: z.email().max(255),
  password: z.string().min(8).max(100),
  planId: z.uuid().optional(),
});

export interface RegisterSubscriptionInfo {
  accessStatus: string;
  subscriptionStatus: string | null;
  planId: string | null;
  planName: string | null;
  trialEndsAt: string | null;
  subscriptionExpiresAt: string | null;
}

export interface RegisterResult {
  accessToken: string;
  refreshToken: string;
  user: { id: string; name: string; email: string; role: string };
  personal: { id: string; slug: string; onboardingCompleted: boolean };
  subscription: RegisterSubscriptionInfo;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly personalsRepository: PersonalsRepository,
    private readonly plansRepository: PlansRepository,
    private readonly jwtService: JwtService,
    private readonly drizzle: DrizzleProvider,
    private readonly stripeProvider: StripeProvider,
    private readonly resendProvider: ResendProvider,
  ) { }

  async execute(body: unknown): Promise<RegisterResult> {
    const data = validate(registerSchema, body);

    // Check duplicate email
    // CHK-038: This reveals email existence (409 vs 201). Accepted risk — rate limiting
    // (3 req/min on register) makes enumeration impractical. A full fix would require
    // switching to a "check your email" flow, which changes the registration UX significantly.
    const existingUser = await this.usersRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    // Find plan
    const plan = data.planId
      ? await this.plansRepository.findById(data.planId)
      : await this.plansRepository.findDefault();

    if (!plan) {
      throw new NotFoundException("Plan not found");
    }

    // Hash password with pepper
    const hashedPassword = await argon2.hash(data.password + env.HASH_PEPPER);

    // Generate unique slug (before transaction — read-only)
    const slug = await generateUniqueSlug(data.name, this.personalsRepository);

    // Stripe integration (when plan has a price and Stripe is configured)
    let stripeCustomerId: string | undefined;
    let stripeSubscriptionId: string | undefined;
    let subscriptionStatus: string | undefined;
    const now = new Date();
    const trialStartedAt = now;
    const trialEndsAt = addDays(now, TRIAL_DAYS);

    // CHK-020: Wrap all DB writes in a single transaction
    let user: { id: string; name: string; email: string; role: string };
    let personal: { id: string; slug: string; onboardingCompleted: boolean; accessStatus: string; subscriptionStatus: string | null; subscriptionPlanId: string | null; trialEndsAt: Date | null; subscriptionExpiresAt: Date | null };
    let accessToken: string;
    let refreshToken: string;

    await this.drizzle.db.transaction(async (tx) => {
      // Create user inside transaction
      const createdUser = await this.usersRepository.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: ApplicationRoles.PERSONAL,
      }, tx);

      // Stripe calls (external — cannot be rolled back, but user + personal are atomic)
      if (plan.stripePriceId && this.stripeProvider.isConfigured()) {
        try {
          const customer = await this.stripeProvider.client!.customers.create({
            email: data.email,
            name: data.name,
            metadata: { userId: createdUser.id },
          });
          stripeCustomerId = customer.id;

          const subscription = await this.stripeProvider.client!.subscriptions.create({
            customer: customer.id,
            items: [{ price: plan.stripePriceId }],
            trial_period_days: TRIAL_DAYS,
          });
          stripeSubscriptionId = subscription.id;
          subscriptionStatus = subscription.status;
        } catch (stripeError) {
          // Stripe failed — transaction will roll back user, cleaning up the orphan
          throw stripeError;
        }
      }

      // Create personal inside same transaction
      const createdPersonal = await this.personalsRepository.create({
        userId: createdUser.id,
        slug,
        accessStatus: "trialing",
        subscriptionPlanId: plan.id,
        trialStartedAt,
        trialEndsAt,
        stripeCustomerId,
        stripeSubscriptionId,
        subscriptionStatus,
      }, tx);

      // Generate refresh token inside transaction
      const { raw, hash: refreshTokenHash } = generateSetupToken();
      await this.usersRepository.updateRefreshTokenHash(createdUser.id, refreshTokenHash, tx);

      // Generate access token
      const tokenPayload: IAccessToken = {
        sub: createdUser.id,
        role: ApplicationRoles.PERSONAL,
        profileId: createdPersonal.id,
        personalId: createdPersonal.id,
        personalSlug: createdPersonal.slug,
      };
      accessToken = this.jwtService.sign(tokenPayload);
      refreshToken = raw;

      user = {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
      };
      personal = {
        id: createdPersonal.id,
        slug: createdPersonal.slug,
        onboardingCompleted: createdPersonal.onboardingCompleted,
        accessStatus: createdPersonal.accessStatus,
        subscriptionStatus: createdPersonal.subscriptionStatus ?? null,
        subscriptionPlanId: createdPersonal.subscriptionPlanId ?? null,
        trialEndsAt: createdPersonal.trialEndsAt ?? null,
        subscriptionExpiresAt: createdPersonal.subscriptionExpiresAt ?? null,
      };
    });

    // Fire-and-forget welcome email — failure must not block registration
    this.resendProvider.sendWelcome({ to: user!.email, userName: user!.name });

    return {
      accessToken: accessToken!,
      refreshToken: refreshToken!,
      user: user!,
      personal: {
        id: personal!.id,
        slug: personal!.slug,
        onboardingCompleted: personal!.onboardingCompleted,
      },
      subscription: {
        accessStatus: personal!.accessStatus,
        subscriptionStatus: personal!.subscriptionStatus,
        planId: personal!.subscriptionPlanId,
        planName: plan.name,
        trialEndsAt: personal!.trialEndsAt?.toISOString() ?? null,
        subscriptionExpiresAt: personal!.subscriptionExpiresAt?.toISOString() ?? null,
      },
    };
  }
}
