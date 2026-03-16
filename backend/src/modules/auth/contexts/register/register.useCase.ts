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
import { StripeProvider } from "@shared/providers/stripe.provider";
import { generateUniqueSlug } from "@shared/utils/generateUniqueSlug.util";
import { generateSetupToken } from "@shared/utils/token.util";
import { validate } from "@shared/utils/validation.util";

const TRIAL_DAYS = 7;

const registerSchema = z.object({
  name: z.string().min(3).max(150),
  email: z.email().max(255),
  password: z.string().min(8).max(100),
  planId: z.uuid().optional(),
});

export interface RegisterResult {
  accessToken: string;
  refreshToken: string;
  user: { id: string; name: string; email: string; role: string };
  personal: { id: string; slug: string };
}

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly personalsRepository: PersonalsRepository,
    private readonly plansRepository: PlansRepository,
    private readonly jwtService: JwtService,
    private readonly stripeProvider: StripeProvider,
  ) { }

  async execute(body: unknown): Promise<RegisterResult> {
    const data = validate(registerSchema, body);

    // Check duplicate email
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

    // Create user
    const user = await this.usersRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: ApplicationRoles.PERSONAL,
    });

    // Generate unique slug
    const slug = await generateUniqueSlug(data.name, this.personalsRepository);

    // Stripe integration (when plan has a price and Stripe is configured)
    let stripeCustomerId: string | undefined;
    let stripeSubscriptionId: string | undefined;
    let subscriptionStatus: string | undefined;
    const now = new Date();
    const trialStartedAt = now;
    const trialEndsAt = addDays(now, TRIAL_DAYS);

    if (plan.stripePriceId && this.stripeProvider.isConfigured()) {
      const customer = await this.stripeProvider.client!.customers.create({
        email: data.email,
        name: data.name,
        metadata: { userId: user.id },
      });
      stripeCustomerId = customer.id;

      const subscription = await this.stripeProvider.client!.subscriptions.create({
        customer: customer.id,
        items: [{ price: plan.stripePriceId }],
        trial_period_days: TRIAL_DAYS,
      });
      stripeSubscriptionId = subscription.id;
      subscriptionStatus = subscription.status;
    }

    // Create personal
    const personal = await this.personalsRepository.create({
      userId: user.id,
      slug,
      accessStatus: "trialing",
      subscriptionPlanId: plan.id,
      trialStartedAt,
      trialEndsAt,
      stripeCustomerId,
      stripeSubscriptionId,
      subscriptionStatus,
    });

    // Generate access token
    const tokenPayload: IAccessToken = {
      sub: user.id,
      role: ApplicationRoles.PERSONAL,
      profileId: personal.id,
      personalId: personal.id,
      personalSlug: personal.slug,
    };
    const accessToken = this.jwtService.sign(tokenPayload);

    // Generate refresh token (opaque, stored as hash)
    const { raw: refreshToken, hash: refreshTokenHash } = generateSetupToken();
    await this.usersRepository.updateRefreshTokenHash(user.id, refreshTokenHash);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      personal: {
        id: personal.id,
        slug: personal.slug,
      },
    };
  }
}
