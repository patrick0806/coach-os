import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { personals, Personal } from "@config/database/schema/personals";
import { users } from "@config/database/schema/users";

@Injectable()
export class PersonalsRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async findById(id: string): Promise<Personal | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(personals)
      .where(eq(personals.id, id))
      .limit(1);

    return result[0];
  }

  async findByUserId(userId: string): Promise<Personal | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(personals)
      .where(eq(personals.userId, userId))
      .limit(1);

    return result[0];
  }

  async findBySlug(slug: string): Promise<(Personal & { coachName: string }) | undefined> {
    const result = await this.drizzle.db
      .select({ personal: personals, coachName: users.name })
      .from(personals)
      .innerJoin(users, eq(personals.userId, users.id))
      .where(eq(personals.slug, slug))
      .limit(1);

    if (!result[0]) return undefined;
    return { ...result[0].personal, coachName: result[0].coachName };
  }

  async create(data: {
    userId: string;
    slug: string;
    accessStatus: "active" | "suspended" | "trialing" | "expired" | "past_due";
    subscriptionPlanId: string;
    trialStartedAt?: Date;
    trialEndsAt?: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionStatus?: string;
  }): Promise<Personal> {
    const result = await this.drizzle.db
      .insert(personals)
      .values(data)
      .returning();

    return result[0];
  }

  async updateSubscription(
    id: string,
    data: Partial<
      Pick<
        Personal,
        | "accessStatus"
        | "subscriptionStatus"
        | "subscriptionExpiresAt"
        | "stripeSubscriptionId"
        | "stripeCustomerId"
        | "subscriptionPlanId"
      >
    >,
  ): Promise<void> {
    await this.drizzle.db
      .update(personals)
      .set(data)
      .where(eq(personals.id, id));
  }

  async setWhitelisted(id: string, value: boolean): Promise<void> {
    await this.drizzle.db
      .update(personals)
      .set({ isWhitelisted: value })
      .where(eq(personals.id, id));
  }

  async findByStripeCustomerId(customerId: string): Promise<Personal | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(personals)
      .where(eq(personals.stripeCustomerId, customerId))
      .limit(1);

    return result[0];
  }

  async updateProfile(
    id: string,
    data: Partial<
      Pick<
        Personal,
        | "bio"
        | "phoneNumber"
        | "specialties"
        | "themeColor"
        | "profilePhoto"
        | "logoUrl"
        | "lpTitle"
        | "lpSubtitle"
        | "lpHeroImage"
        | "lpAboutTitle"
        | "lpAboutText"
        | "lpImage1"
        | "lpImage2"
        | "lpImage3"
      >
    >,
  ): Promise<Personal | undefined> {
    const result = await this.drizzle.db
      .update(personals)
      .set(data as any)
      .where(eq(personals.id, id))
      .returning();

    return result[0];
  }
}
