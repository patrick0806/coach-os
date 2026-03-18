import { Injectable } from "@nestjs/common";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import {
  progressCheckins,
  progressPhotos,
  progressRecords,
} from "@config/database/schema/progress";

export type ProgressCheckin = InferSelectModel<typeof progressCheckins>;
export type ProgressRecord = InferSelectModel<typeof progressRecords>;
export type ProgressPhoto = InferSelectModel<typeof progressPhotos>;

export type CheckinRecord = Pick<
  ProgressRecord,
  "id" | "metricType" | "value" | "unit" | "notes"
>;
export type CheckinPhoto = Pick<ProgressPhoto, "id" | "mediaUrl" | "notes">;

export type ProgressCheckinWithData = ProgressCheckin & {
  records: CheckinRecord[];
  photos: CheckinPhoto[];
};

@Injectable()
export class ProgressCheckinsRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async createWithData(
    data: {
      tenantId: string;
      studentId: string;
      checkinDate: string;
      notes?: string;
    },
    records: {
      metricType: string;
      value: string;
      unit: string;
      notes?: string;
    }[],
    photos: {
      mediaUrl: string;
      notes?: string;
    }[],
  ): Promise<ProgressCheckinWithData> {
    return this.drizzle.db.transaction(async (tx) => {
      const [checkin] = await tx
        .insert(progressCheckins)
        .values({
          tenantId: data.tenantId,
          studentId: data.studentId,
          checkinDate: data.checkinDate,
          notes: data.notes,
        } as any)
        .returning();

      const insertedRecords: CheckinRecord[] = [];
      const insertedPhotos: CheckinPhoto[] = [];

      if (records.length > 0) {
        const now = new Date();
        const rows = await tx
          .insert(progressRecords)
          .values(
            records.map((r) => ({
              tenantId: data.tenantId,
              studentId: data.studentId,
              checkinId: checkin.id,
              metricType: r.metricType,
              value: r.value,
              unit: r.unit,
              recordedAt: now,
              notes: r.notes,
            })) as any[],
          )
          .returning();
        insertedRecords.push(
          ...rows.map((r) => ({
            id: r.id,
            metricType: r.metricType,
            value: r.value,
            unit: r.unit,
            notes: r.notes,
          })),
        );
      }

      if (photos.length > 0) {
        const rows = await tx
          .insert(progressPhotos)
          .values(
            photos.map((p) => ({
              tenantId: data.tenantId,
              studentId: data.studentId,
              checkinId: checkin.id,
              mediaUrl: p.mediaUrl,
              notes: p.notes,
            })) as any[],
          )
          .returning();
        insertedPhotos.push(
          ...rows.map((p) => ({
            id: p.id,
            mediaUrl: p.mediaUrl,
            notes: p.notes,
          })),
        );
      }

      return { ...checkin, records: insertedRecords, photos: insertedPhotos };
    });
  }

  async findAllByStudentId(
    studentId: string,
    tenantId: string,
    opts: { page: number; size: number },
  ): Promise<{ rows: ProgressCheckinWithData[]; total: number }> {
    const { page, size } = opts;

    const conditions = and(
      eq(progressCheckins.studentId, studentId),
      eq(progressCheckins.tenantId, tenantId),
    );

    const [checkinRows, totalResult] = await Promise.all([
      this.drizzle.db
        .select()
        .from(progressCheckins)
        .where(conditions)
        .orderBy(desc(progressCheckins.checkinDate))
        .limit(size)
        .offset(page * size),
      this.drizzle.db
        .select({ value: sql<number>`count(*)` })
        .from(progressCheckins)
        .where(conditions),
    ]);

    if (checkinRows.length === 0) {
      return { rows: [], total: 0 };
    }

    const checkinIds = checkinRows.map((c) => c.id);

    const [recordRows, photoRows] = await Promise.all([
      this.drizzle.db
        .select({
          id: progressRecords.id,
          checkinId: progressRecords.checkinId,
          metricType: progressRecords.metricType,
          value: progressRecords.value,
          unit: progressRecords.unit,
          notes: progressRecords.notes,
        })
        .from(progressRecords)
        .where(inArray(progressRecords.checkinId, checkinIds)),
      this.drizzle.db
        .select({
          id: progressPhotos.id,
          checkinId: progressPhotos.checkinId,
          mediaUrl: progressPhotos.mediaUrl,
          notes: progressPhotos.notes,
        })
        .from(progressPhotos)
        .where(inArray(progressPhotos.checkinId, checkinIds)),
    ]);

    const rows = checkinRows.map((checkin) => ({
      ...checkin,
      records: recordRows
        .filter((r) => r.checkinId === checkin.id)
        .map((r) => ({
          id: r.id,
          metricType: r.metricType,
          value: r.value,
          unit: r.unit,
          notes: r.notes,
        })),
      photos: photoRows
        .filter((p) => p.checkinId === checkin.id)
        .map((p) => ({
          id: p.id,
          mediaUrl: p.mediaUrl,
          notes: p.notes,
        })),
    }));

    return {
      rows,
      total: Number(totalResult[0]?.value ?? 0),
    };
  }

  async findById(
    id: string,
    tenantId: string,
  ): Promise<ProgressCheckinWithData | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(progressCheckins)
      .where(
        and(
          eq(progressCheckins.id, id),
          eq(progressCheckins.tenantId, tenantId),
        ),
      )
      .limit(1);

    if (!result[0]) return undefined;

    const checkin = result[0];

    const [recordRows, photoRows] = await Promise.all([
      this.drizzle.db
        .select({
          id: progressRecords.id,
          metricType: progressRecords.metricType,
          value: progressRecords.value,
          unit: progressRecords.unit,
          notes: progressRecords.notes,
        })
        .from(progressRecords)
        .where(eq(progressRecords.checkinId, checkin.id)),
      this.drizzle.db
        .select({
          id: progressPhotos.id,
          mediaUrl: progressPhotos.mediaUrl,
          notes: progressPhotos.notes,
        })
        .from(progressPhotos)
        .where(eq(progressPhotos.checkinId, checkin.id)),
    ]);

    return { ...checkin, records: recordRows, photos: photoRows };
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await this.drizzle.db
      .delete(progressCheckins)
      .where(
        and(
          eq(progressCheckins.id, id),
          eq(progressCheckins.tenantId, tenantId),
        ),
      )
      .returning();

    return result.length > 0;
  }
}
