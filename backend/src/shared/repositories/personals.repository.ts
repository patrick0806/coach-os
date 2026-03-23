import { Injectable } from "@nestjs/common";
import { asc, eq, gte, ilike, or, sql } from "drizzle-orm";

import { DbTransaction, DrizzleProvider } from "@shared/providers/drizzle.service";
import { personals, Personal, LpFields } from "@config/database/schema/personals";
import { users } from "@config/database/schema/users";

@Injectable()
export class PersonalsRepository {
  constructor(private readonly drizzle: DrizzleProvider) { }

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
  }, tx?: DbTransaction): Promise<Personal> {
    const result = await (tx ?? this.drizzle.db)
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
      .set({ isWhitelisted: value } as any)
      .where(eq(personals.id, id));
  }

  async findAllPaginated(opts: {
    page: number;
    size: number;
    search?: string;
  }): Promise<{ rows: Array<Personal & { name: string; email: string }>; total: number }> {
    const { page, size, search } = opts;

    const conditions = search
      ? or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`))
      : undefined;

    const [rows, totalResult] = await Promise.all([
      this.drizzle.db
        .select({
          id: personals.id,
          userId: personals.userId,
          slug: personals.slug,
          accessStatus: personals.accessStatus,
          subscriptionPlanId: personals.subscriptionPlanId,
          subscriptionStatus: personals.subscriptionStatus,
          isWhitelisted: personals.isWhitelisted,
          onboardingCompleted: personals.onboardingCompleted,
          stripeCustomerId: personals.stripeCustomerId,
          stripeSubscriptionId: personals.stripeSubscriptionId,
          subscriptionExpiresAt: personals.subscriptionExpiresAt,
          trialStartedAt: personals.trialStartedAt,
          trialEndsAt: personals.trialEndsAt,
          bio: personals.bio,
          profilePhoto: personals.profilePhoto,
          logoUrl: personals.logoUrl,
          themeColor: personals.themeColor,
          phoneNumber: personals.phoneNumber,
          specialties: personals.specialties,
          lpTitle: personals.lpTitle,
          lpSubtitle: personals.lpSubtitle,
          lpHeroImage: personals.lpHeroImage,
          lpAboutTitle: personals.lpAboutTitle,
          lpAboutText: personals.lpAboutText,
          lpImage1: personals.lpImage1,
          lpImage2: personals.lpImage2,
          lpImage3: personals.lpImage3,
          createdAt: personals.createdAt,
          updatedAt: personals.updatedAt,
          name: users.name,
          email: users.email,
        })
        .from(personals)
        .innerJoin(users, eq(personals.userId, users.id))
        .where(conditions)
        .orderBy(asc(users.name))
        .limit(size)
        .offset(page * size),
      this.drizzle.db
        .select({ value: sql<number>`count(*)` })
        .from(personals)
        .innerJoin(users, eq(personals.userId, users.id))
        .where(conditions),
    ]);

    return {
      rows: rows as Array<Personal & { name: string; email: string }>,
      total: Number(totalResult[0]?.value ?? 0),
    };
  }

  async countAll(): Promise<number> {
    const result = await this.drizzle.db
      .select({ value: sql<number>`count(*)` })
      .from(personals);
    return Number(result[0]?.value ?? 0);
  }

  async countByAccessStatus(status: string): Promise<number> {
    const result = await this.drizzle.db
      .select({ value: sql<number>`count(*)` })
      .from(personals)
      .where(eq(personals.accessStatus, status as "active" | "suspended" | "trialing" | "expired" | "past_due"));
    return Number(result[0]?.value ?? 0);
  }

  async countWhitelisted(): Promise<number> {
    const result = await this.drizzle.db
      .select({ value: sql<number>`count(*)` })
      .from(personals)
      .where(eq(personals.isWhitelisted, true));
    return Number(result[0]?.value ?? 0);
  }

  async countCreatedThisMonth(): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const result = await this.drizzle.db
      .select({ value: sql<number>`count(*)` })
      .from(personals)
      .where(gte(personals.createdAt, startOfMonth));
    return Number(result[0]?.value ?? 0);
  }

  async countBySubscriptionPlanId(planId: string): Promise<number> {
    const result = await this.drizzle.db
      .select({ value: sql<number>`count(*)` })
      .from(personals)
      .where(eq(personals.subscriptionPlanId, planId));
    return Number(result[0]?.value ?? 0);
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
        | "slug"
        | "bio"
        | "phoneNumber"
        | "specialties"
        | "themeColor"
        | "themeColorSecondary"
        | "profilePhoto"
        | "logoUrl"
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

  async saveLpDraft(id: string, data: LpFields): Promise<void> {
    await this.drizzle.db
      .update(personals)
      .set({ lpDraftData: data } as any)
      .where(eq(personals.id, id));
  }

  async getTourProgress(tenantId: string): Promise<string[]> {
    const result = await this.drizzle.db
      .select({ tourCompletedPages: personals.tourCompletedPages })
      .from(personals)
      .where(eq(personals.id, tenantId))
      .limit(1);

    return (result[0]?.tourCompletedPages as string[]) ?? [];
  }

  async markPageToured(tenantId: string, page: string): Promise<string[]> {
    const current = await this.getTourProgress(tenantId);
    const updated = Array.from(new Set([...current, page]));

    const ALL_TOUR_PAGES = [
      "exercises",
      "students",
      "training",
      "schedule",
      "availability",
      "services",
      "landingPage",
      "profile",
    ];
    const allCompleted = ALL_TOUR_PAGES.every((p) => updated.includes(p));

    await this.drizzle.db
      .update(personals)
      .set({
        tourCompletedPages: updated,
        ...(allCompleted && { onboardingCompleted: true }),
      } as any)
      .where(eq(personals.id, tenantId));

    return updated;
  }

  async publishLpDraft(id: string): Promise<void> {
    const profile = await this.findById(id);
    if (!profile?.lpDraftData) return;

    const draft = profile.lpDraftData as LpFields;

    await this.drizzle.db
      .update(personals)
      .set({
        ...(draft.lpLayout !== undefined && { lpLayout: draft.lpLayout }),
        ...(draft.lpTitle !== undefined && { lpTitle: draft.lpTitle }),
        ...(draft.lpSubtitle !== undefined && { lpSubtitle: draft.lpSubtitle }),
        ...(draft.lpHeroImage !== undefined && { lpHeroImage: draft.lpHeroImage }),
        ...(draft.lpAboutTitle !== undefined && { lpAboutTitle: draft.lpAboutTitle }),
        ...(draft.lpAboutText !== undefined && { lpAboutText: draft.lpAboutText }),
        ...(draft.lpImage1 !== undefined && { lpImage1: draft.lpImage1 }),
        ...(draft.lpImage2 !== undefined && { lpImage2: draft.lpImage2 }),
        ...(draft.lpImage3 !== undefined && { lpImage3: draft.lpImage3 }),
        lpDraftData: null,
      } as any)
      .where(eq(personals.id, id));
  }
}
