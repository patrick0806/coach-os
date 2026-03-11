import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import {
  personals,
  Personal,
} from "@config/database/schema/personals";

type DrizzleDb = NodePgDatabase<typeof schema>;

// Explicit input type — avoids relying on Partial<NewPersonal> which in
// Drizzle v0.39 only surfaces the two NOT NULL / no-default columns (userId, slug).
export interface UpdatePersonalInput {
  bio?: string | null;
  profilePhoto?: string | null;
  themeColor?: string;
  phoneNumber?: string | null;
  lpTitle?: string | null;
  lpSubtitle?: string | null;
  lpHeroImage?: string | null;
  lpAboutTitle?: string | null;
  lpAboutText?: string | null;
  lpImage1?: string | null;
  lpImage2?: string | null;
  lpImage3?: string | null;
}

export interface UpdateSubscriptionInput {
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionStatus?: string | null;
  subscriptionPlanId?: string | null;
  subscriptionExpiresAt?: Date | null;
  trialStartedAt?: Date | null;
  trialEndsAt?: Date | null;
  accessStatus?: string | null;
}

export interface CreatePersonalInput {
  userId: string;
  slug: string;
  trialStartedAt?: Date;
  trialEndsAt?: Date;
  accessStatus?: string;
  subscriptionPlanId?: string;
  subscriptionStatus?: string;
  subscriptionExpiresAt?: Date;
}

@Injectable()
export class PersonalsRepository {
  constructor(private drizzle: DrizzleProvider) {}

  async findBySlug(slug: string, tx?: DrizzleDb): Promise<Personal | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select()
      .from(personals)
      .where(eq(personals.slug, slug))
      .limit(1);
    return result[0] ?? null;
  }

  async findByUserId(userId: string, tx?: DrizzleDb): Promise<Personal | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select()
      .from(personals)
      .where(eq(personals.userId, userId))
      .limit(1);
    return result[0] ?? null;
  }

  async findById(id: string, tx?: DrizzleDb): Promise<Personal | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select()
      .from(personals)
      .where(eq(personals.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: CreatePersonalInput, tx?: DrizzleDb): Promise<Personal> {
    const db = tx ?? this.drizzle.db;
    // Cast needed: Drizzle v0.39 $inferInsert narrowing
     
    const result = await db.insert(personals).values(data as any).returning();
    return result[0];
  }

  async update(
    id: string,
    data: UpdatePersonalInput,
    tx?: DrizzleDb,
  ): Promise<Personal> {
    const db = tx ?? this.drizzle.db;
    // Cast needed: Drizzle v0.39 $inferUpdate narrowing
     
    const result = await db.update(personals).set(data as any).where(eq(personals.id, id)).returning();
    return result[0];
  }

  async findByStripeCustomerId(
    customerId: string,
    tx?: DrizzleDb,
  ): Promise<Personal | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select()
      .from(personals)
      .where(eq(personals.stripeCustomerId, customerId))
      .limit(1);
    return result[0] ?? null;
  }

  async updateSubscription(
    id: string,
    data: UpdateSubscriptionInput,
    tx?: DrizzleDb,
  ): Promise<Personal> {
    const db = tx ?? this.drizzle.db;
     
    const result = await db.update(personals).set(data as any).where(eq(personals.id, id)).returning();
    return result[0];
  }
}
