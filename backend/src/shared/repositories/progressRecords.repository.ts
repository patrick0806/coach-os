import { Injectable } from "@nestjs/common";
import { and, desc, eq, sql } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { progressRecords } from "@config/database/schema/progress";

export type ProgressRecord = InferSelectModel<typeof progressRecords>;

@Injectable()
export class ProgressRecordsRepository {
  constructor(private readonly drizzle: DrizzleProvider) { }

  async create(data: {
    tenantId: string;
    studentId: string;
    metricType: string;
    value: string;
    unit: string;
    recordedAt: Date;
    notes?: string;
  }): Promise<ProgressRecord> {
    const result = await this.drizzle.db
      .insert(progressRecords)
      .values({
        tenantId: data.tenantId,
        studentId: data.studentId,
        metricType: data.metricType,
        value: data.value,
        unit: data.unit,
        recordedAt: data.recordedAt,
        notes: data.notes,
      } as any)
      .returning();

    return result[0];
  }

  async findAllByStudentId(
    studentId: string,
    tenantId: string,
    opts: { page: number; size: number; metricType?: string },
  ): Promise<{ rows: ProgressRecord[]; total: number }> {
    const { page, size, metricType } = opts;

    const conditions = and(
      eq(progressRecords.studentId, studentId),
      eq(progressRecords.tenantId, tenantId),
      metricType ? eq(progressRecords.metricType, metricType) : undefined,
    );

    const [rows, totalResult] = await Promise.all([
      this.drizzle.db
        .select()
        .from(progressRecords)
        .where(conditions)
        .orderBy(desc(progressRecords.recordedAt))
        .limit(size)
        .offset(page * size),
      this.drizzle.db
        .select({ value: sql<number>`count(*)` })
        .from(progressRecords)
        .where(conditions),
    ]);

    return {
      rows,
      total: Number(totalResult[0]?.value ?? 0),
    };
  }

  async findById(id: string, tenantId: string): Promise<ProgressRecord | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(progressRecords)
      .where(and(eq(progressRecords.id, id), eq(progressRecords.tenantId, tenantId)))
      .limit(1);

    return result[0];
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<{
      metricType: string;
      value: string;
      unit: string;
      recordedAt: Date;
      notes: string | null;
    }>,
  ): Promise<ProgressRecord | undefined> {
     
    const result = await this.drizzle.db
      .update(progressRecords)
      .set(data as any)
      .where(and(eq(progressRecords.id, id), eq(progressRecords.tenantId, tenantId)))
      .returning();

    return result[0];
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await this.drizzle.db
      .delete(progressRecords)
      .where(and(eq(progressRecords.id, id), eq(progressRecords.tenantId, tenantId)))
      .returning();

    return result.length > 0;
  }
}
