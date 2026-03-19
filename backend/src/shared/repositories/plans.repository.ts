import { Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { plans } from "@config/database/schema/plans";
import type { InferSelectModel } from "drizzle-orm";

export type Plan = InferSelectModel<typeof plans>;

@Injectable()
export class PlansRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async findById(id: string): Promise<Plan | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(plans)
      .where(and(eq(plans.id, id), eq(plans.isActive, true)))
      .limit(1);

    return result[0];
  }

  async findDefault(): Promise<Plan | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(plans)
      .where(and(eq(plans.isDefault, true), eq(plans.isActive, true)))
      .limit(1);

    return result[0];
  }

  async findByStripePriceId(stripePriceId: string): Promise<Plan | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(plans)
      .where(and(eq(plans.stripePriceId, stripePriceId), eq(plans.isActive, true)))
      .limit(1);

    return result[0];
  }

  async findAll(): Promise<Plan[]> {
    return this.drizzle.db
      .select()
      .from(plans)
      .where(eq(plans.isActive, true))
      .orderBy(plans.order);
  }
}
