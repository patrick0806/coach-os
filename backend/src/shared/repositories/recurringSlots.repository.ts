import { Injectable } from "@nestjs/common";
import { and, eq, gte, isNull, lte, or } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { recurringSlots } from "@config/database/schema/schedulingV2";

export type RecurringSlot = InferSelectModel<typeof recurringSlots>;

@Injectable()
export class RecurringSlotsRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async create(data: {
    tenantId: string;
    studentId?: string;
    studentProgramId?: string;
    type: "booking" | "block";
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    location?: string;
    effectiveFrom: string;
    effectiveTo?: string;
  }): Promise<RecurringSlot> {
    const result = await this.drizzle.db
      .insert(recurringSlots)
      .values(data)
      .returning();

    return result[0];
  }

  async findByTenantId(
    tenantId: string,
    onlyActive = true,
  ): Promise<RecurringSlot[]> {
    const conditions = and(
      eq(recurringSlots.tenantId, tenantId),
      onlyActive ? eq(recurringSlots.isActive, true) : undefined,
    );

    return this.drizzle.db
      .select()
      .from(recurringSlots)
      .where(conditions)
      .orderBy(recurringSlots.dayOfWeek, recurringSlots.startTime);
  }

  async findByStudentId(
    studentId: string,
    tenantId: string,
    onlyActive = true,
  ): Promise<RecurringSlot[]> {
    const conditions = and(
      eq(recurringSlots.studentId, studentId),
      eq(recurringSlots.tenantId, tenantId),
      onlyActive ? eq(recurringSlots.isActive, true) : undefined,
    );

    return this.drizzle.db
      .select()
      .from(recurringSlots)
      .where(conditions)
      .orderBy(recurringSlots.dayOfWeek, recurringSlots.startTime);
  }

  async findActiveInDateRange(
    tenantId: string,
    startDate: string,
    endDate: string,
  ): Promise<RecurringSlot[]> {
    return this.drizzle.db
      .select()
      .from(recurringSlots)
      .where(
        and(
          eq(recurringSlots.tenantId, tenantId),
          eq(recurringSlots.isActive, true),
          lte(recurringSlots.effectiveFrom, endDate),
          or(
            isNull(recurringSlots.effectiveTo),
            gte(recurringSlots.effectiveTo, startDate),
          ),
        ),
      )
      .orderBy(recurringSlots.dayOfWeek, recurringSlots.startTime);
  }

  async findById(
    id: string,
    tenantId: string,
  ): Promise<RecurringSlot | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(recurringSlots)
      .where(
        and(
          eq(recurringSlots.id, id),
          eq(recurringSlots.tenantId, tenantId),
        ),
      )
      .limit(1);

    return result[0];
  }

  async findByDayOfWeek(
    tenantId: string,
    dayOfWeek: number,
    onlyActive = true,
  ): Promise<RecurringSlot[]> {
    const conditions = and(
      eq(recurringSlots.tenantId, tenantId),
      eq(recurringSlots.dayOfWeek, dayOfWeek),
      onlyActive ? eq(recurringSlots.isActive, true) : undefined,
    );

    return this.drizzle.db
      .select()
      .from(recurringSlots)
      .where(conditions)
      .orderBy(recurringSlots.startTime);
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<{
      effectiveTo: string;
      isActive: boolean;
      location: string | null;
      studentProgramId: string | null;
    }>,
  ): Promise<RecurringSlot | undefined> {
    const result = await this.drizzle.db
      .update(recurringSlots)
      .set(data as any)
      .where(
        and(
          eq(recurringSlots.id, id),
          eq(recurringSlots.tenantId, tenantId),
        ),
      )
      .returning();

    return result[0];
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await this.drizzle.db
      .delete(recurringSlots)
      .where(
        and(
          eq(recurringSlots.id, id),
          eq(recurringSlots.tenantId, tenantId),
        ),
      )
      .returning();

    return result.length > 0;
  }

  async deactivateByProgramId(
    studentProgramId: string,
    tenantId: string,
  ): Promise<number> {
    const today = new Date().toISOString().split("T")[0];

    const result = await this.drizzle.db
      .update(recurringSlots)
      .set({ isActive: false, effectiveTo: today } as any)
      .where(
        and(
          eq(recurringSlots.studentProgramId, studentProgramId),
          eq(recurringSlots.tenantId, tenantId),
          eq(recurringSlots.isActive, true),
        ),
      )
      .returning();

    return result.length;
  }
}
