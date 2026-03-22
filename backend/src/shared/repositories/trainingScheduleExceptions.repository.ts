import { Injectable } from "@nestjs/common";
import { and, eq, gte, lte, inArray } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { trainingScheduleExceptions } from "@config/database/schema/scheduling";

export type TrainingScheduleException = InferSelectModel<typeof trainingScheduleExceptions>;

@Injectable()
export class TrainingScheduleExceptionsRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async create(data: {
    tenantId: string;
    trainingScheduleId: string;
    originalDate: string;
    action: "skip" | "reschedule";
    newDate?: string;
    newStartTime?: string;
    newEndTime?: string;
    newLocation?: string;
    reason?: string;
  }): Promise<TrainingScheduleException> {
    const result = await this.drizzle.db
      .insert(trainingScheduleExceptions)
      .values(data)
      .returning();

    return result[0];
  }

  async findByScheduleAndOriginalDate(
    trainingScheduleId: string,
    originalDate: string,
    tenantId: string,
  ): Promise<TrainingScheduleException | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(trainingScheduleExceptions)
      .where(
        and(
          eq(trainingScheduleExceptions.trainingScheduleId, trainingScheduleId),
          eq(trainingScheduleExceptions.originalDate, originalDate),
          eq(trainingScheduleExceptions.tenantId, tenantId),
        ),
      )
      .limit(1);

    return result[0];
  }

  async findByScheduleIdsAndDateRange(
    scheduleIds: string[],
    startDate: string,
    endDate: string,
    tenantId: string,
  ): Promise<TrainingScheduleException[]> {
    if (scheduleIds.length === 0) return [];

    return this.drizzle.db
      .select()
      .from(trainingScheduleExceptions)
      .where(
        and(
          inArray(trainingScheduleExceptions.trainingScheduleId, scheduleIds),
          eq(trainingScheduleExceptions.tenantId, tenantId),
          gte(trainingScheduleExceptions.originalDate, startDate),
          lte(trainingScheduleExceptions.originalDate, endDate),
        ),
      );
  }

  async findById(
    id: string,
    tenantId: string,
  ): Promise<TrainingScheduleException | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(trainingScheduleExceptions)
      .where(
        and(
          eq(trainingScheduleExceptions.id, id),
          eq(trainingScheduleExceptions.tenantId, tenantId),
        ),
      )
      .limit(1);

    return result[0];
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await this.drizzle.db
      .delete(trainingScheduleExceptions)
      .where(
        and(
          eq(trainingScheduleExceptions.id, id),
          eq(trainingScheduleExceptions.tenantId, tenantId),
        ),
      )
      .returning();

    return result.length > 0;
  }
}
