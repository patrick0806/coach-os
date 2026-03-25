import { Injectable } from "@nestjs/common";
import { and, eq, gte, isNull, lte, or } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { workingHours } from "@config/database/schema/scheduling";

export type WorkingHours = InferSelectModel<typeof workingHours>;

@Injectable()
export class WorkingHoursRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async create(data: {
    tenantId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    effectiveFrom: string;
    effectiveTo?: string;
  }): Promise<WorkingHours> {
    const result = await this.drizzle.db
      .insert(workingHours)
      .values(data)
      .returning();

    return result[0];
  }

  async createMany(
    data: {
      tenantId: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      effectiveFrom: string;
    }[],
  ): Promise<WorkingHours[]> {
    if (data.length === 0) return [];

    return this.drizzle.db
      .insert(workingHours)
      .values(data)
      .returning();
  }

  async findActiveByTenant(tenantId: string): Promise<WorkingHours[]> {
    return this.drizzle.db
      .select()
      .from(workingHours)
      .where(
        and(
          eq(workingHours.tenantId, tenantId),
          eq(workingHours.isActive, true),
          isNull(workingHours.effectiveTo),
        ),
      )
      .orderBy(workingHours.dayOfWeek, workingHours.startTime);
  }

  async findActiveInDateRange(
    tenantId: string,
    startDate: string,
    endDate: string,
  ): Promise<WorkingHours[]> {
    return this.drizzle.db
      .select()
      .from(workingHours)
      .where(
        and(
          eq(workingHours.tenantId, tenantId),
          eq(workingHours.isActive, true),
          lte(workingHours.effectiveFrom, endDate),
          or(
            isNull(workingHours.effectiveTo),
            gte(workingHours.effectiveTo, startDate),
          ),
        ),
      )
      .orderBy(workingHours.dayOfWeek, workingHours.startTime);
  }

  async findById(
    id: string,
    tenantId: string,
  ): Promise<WorkingHours | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(workingHours)
      .where(
        and(
          eq(workingHours.id, id),
          eq(workingHours.tenantId, tenantId),
        ),
      )
      .limit(1);

    return result[0];
  }

  async findByDayOfWeek(
    tenantId: string,
    dayOfWeek: number,
  ): Promise<WorkingHours[]> {
    return this.drizzle.db
      .select()
      .from(workingHours)
      .where(
        and(
          eq(workingHours.tenantId, tenantId),
          eq(workingHours.dayOfWeek, dayOfWeek),
          eq(workingHours.isActive, true),
          isNull(workingHours.effectiveTo),
        ),
      )
      .orderBy(workingHours.startTime);
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<{
      effectiveTo: string;
      isActive: boolean;
    }>,
  ): Promise<WorkingHours | undefined> {
    const result = await this.drizzle.db
      .update(workingHours)
      .set(data as any)
      .where(
        and(
          eq(workingHours.id, id),
          eq(workingHours.tenantId, tenantId),
        ),
      )
      .returning();

    return result[0];
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await this.drizzle.db
      .delete(workingHours)
      .where(
        and(
          eq(workingHours.id, id),
          eq(workingHours.tenantId, tenantId),
        ),
      )
      .returning();

    return result.length > 0;
  }
}
