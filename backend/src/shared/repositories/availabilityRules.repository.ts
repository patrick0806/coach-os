import { Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { availabilityRules } from "@config/database/schema/scheduling";

export type AvailabilityRule = InferSelectModel<typeof availabilityRules>;

@Injectable()
export class AvailabilityRulesRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async create(data: {
    tenantId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }): Promise<AvailabilityRule> {
    const result = await this.drizzle.db
      .insert(availabilityRules)
      .values(data)
      .returning();

    return result[0];
  }

  async findByTenantId(tenantId: string): Promise<AvailabilityRule[]> {
    return this.drizzle.db
      .select()
      .from(availabilityRules)
      .where(
        and(
          eq(availabilityRules.tenantId, tenantId),
          eq(availabilityRules.isActive, true),
        ),
      )
      .orderBy(availabilityRules.dayOfWeek, availabilityRules.startTime);
  }

  async findById(
    id: string,
    tenantId: string,
  ): Promise<AvailabilityRule | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(availabilityRules)
      .where(
        and(
          eq(availabilityRules.id, id),
          eq(availabilityRules.tenantId, tenantId),
        ),
      )
      .limit(1);

    return result[0];
  }

  async findByDayOfWeek(
    tenantId: string,
    dayOfWeek: number,
  ): Promise<AvailabilityRule[]> {
    return this.drizzle.db
      .select()
      .from(availabilityRules)
      .where(
        and(
          eq(availabilityRules.tenantId, tenantId),
          eq(availabilityRules.dayOfWeek, dayOfWeek),
          eq(availabilityRules.isActive, true),
        ),
      )
      .orderBy(availabilityRules.startTime);
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isActive: boolean;
    }>,
  ): Promise<AvailabilityRule | undefined> {
    const result = await this.drizzle.db
      .update(availabilityRules)
      .set(data)
      .where(
        and(
          eq(availabilityRules.id, id),
          eq(availabilityRules.tenantId, tenantId),
        ),
      )
      .returning();

    return result[0];
  }

  async createMany(
    rules: { tenantId: string; dayOfWeek: number; startTime: string; endTime: string }[],
  ): Promise<AvailabilityRule[]> {
    if (rules.length === 0) return [];

    return this.drizzle.db
      .insert(availabilityRules)
      .values(rules)
      .returning();
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await this.drizzle.db
      .delete(availabilityRules)
      .where(
        and(
          eq(availabilityRules.id, id),
          eq(availabilityRules.tenantId, tenantId),
        ),
      )
      .returning();

    return result.length > 0;
  }
}
