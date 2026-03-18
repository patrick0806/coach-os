import { Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { trainingSchedules } from "@config/database/schema/scheduling";

export type TrainingSchedule = InferSelectModel<typeof trainingSchedules>;

@Injectable()
export class TrainingSchedulesRepository {
  constructor(private readonly drizzle: DrizzleProvider) { }

  async create(data: {
    tenantId: string;
    studentId: string;
    studentProgramId?: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    location?: string;
  }): Promise<TrainingSchedule> {
    const result = await this.drizzle.db
      .insert(trainingSchedules)
      .values(data)
      .returning();

    return result[0];
  }

  async findByStudentId(
    studentId: string,
    tenantId: string,
    onlyActive = true,
  ): Promise<TrainingSchedule[]> {
    const conditions = and(
      eq(trainingSchedules.studentId, studentId),
      eq(trainingSchedules.tenantId, tenantId),
      onlyActive ? eq(trainingSchedules.isActive, true) : undefined,
    );

    return this.drizzle.db
      .select()
      .from(trainingSchedules)
      .where(conditions)
      .orderBy(trainingSchedules.dayOfWeek, trainingSchedules.startTime);
  }

  async findByTenantId(
    tenantId: string,
    onlyActive = true,
  ): Promise<TrainingSchedule[]> {
    const conditions = and(
      eq(trainingSchedules.tenantId, tenantId),
      onlyActive ? eq(trainingSchedules.isActive, true) : undefined,
    );

    return this.drizzle.db
      .select()
      .from(trainingSchedules)
      .where(conditions)
      .orderBy(trainingSchedules.dayOfWeek, trainingSchedules.startTime);
  }

  async findById(
    id: string,
    tenantId: string,
  ): Promise<TrainingSchedule | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(trainingSchedules)
      .where(
        and(
          eq(trainingSchedules.id, id),
          eq(trainingSchedules.tenantId, tenantId),
        ),
      )
      .limit(1);

    return result[0];
  }

  async findByDayOfWeek(
    tenantId: string,
    dayOfWeek: number,
    onlyActive = true,
  ): Promise<TrainingSchedule[]> {
    const conditions = and(
      eq(trainingSchedules.tenantId, tenantId),
      eq(trainingSchedules.dayOfWeek, dayOfWeek),
      onlyActive ? eq(trainingSchedules.isActive, true) : undefined,
    );

    return this.drizzle.db
      .select()
      .from(trainingSchedules)
      .where(conditions)
      .orderBy(trainingSchedules.startTime);
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      location: string | null;
      isActive: boolean;
      studentProgramId: string | null;
    }>,
  ): Promise<TrainingSchedule | undefined> {
     
    const result = await this.drizzle.db
      .update(trainingSchedules)
      .set(data as any)
      .where(
        and(
          eq(trainingSchedules.id, id),
          eq(trainingSchedules.tenantId, tenantId),
        ),
      )
      .returning();

    return result[0];
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await this.drizzle.db
      .delete(trainingSchedules)
      .where(
        and(
          eq(trainingSchedules.id, id),
          eq(trainingSchedules.tenantId, tenantId),
        ),
      )
      .returning();

    return result.length > 0;
  }

  async deactivateByProgramId(
    studentProgramId: string,
    tenantId: string,
  ): Promise<number> {
    const result = await this.drizzle.db
      .update(trainingSchedules)
      .set({ isActive: false } as any)
      .where(
        and(
          eq(trainingSchedules.studentProgramId, studentProgramId),
          eq(trainingSchedules.tenantId, tenantId),
          eq(trainingSchedules.isActive, true),
        ),
      )
      .returning();

    return result.length;
  }
}
