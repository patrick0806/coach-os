import { Injectable } from "@nestjs/common";
import { and, desc, eq, sql } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { progressPhotos } from "@config/database/schema/progress";

export type ProgressPhoto = InferSelectModel<typeof progressPhotos>;

@Injectable()
export class ProgressPhotosRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async create(data: {
    tenantId: string;
    studentId: string;
    mediaUrl: string;
    notes?: string;
  }): Promise<ProgressPhoto> {
    const result = await this.drizzle.db
      .insert(progressPhotos)
      .values({
        tenantId: data.tenantId,
        studentId: data.studentId,
        mediaUrl: data.mediaUrl,
        notes: data.notes,
      })
      .returning();

    return result[0];
  }

  async findAllByStudentId(
    studentId: string,
    tenantId: string,
    opts: { page: number; size: number },
  ): Promise<{ rows: ProgressPhoto[]; total: number }> {
    const { page, size } = opts;

    const conditions = and(
      eq(progressPhotos.studentId, studentId),
      eq(progressPhotos.tenantId, tenantId),
    );

    const [rows, totalResult] = await Promise.all([
      this.drizzle.db
        .select()
        .from(progressPhotos)
        .where(conditions)
        .orderBy(desc(progressPhotos.createdAt))
        .limit(size)
        .offset(page * size),
      this.drizzle.db
        .select({ value: sql<number>`count(*)` })
        .from(progressPhotos)
        .where(conditions),
    ]);

    return {
      rows,
      total: Number(totalResult[0]?.value ?? 0),
    };
  }

  async findById(id: string, tenantId: string): Promise<ProgressPhoto | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(progressPhotos)
      .where(and(eq(progressPhotos.id, id), eq(progressPhotos.tenantId, tenantId)))
      .limit(1);

    return result[0];
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await this.drizzle.db
      .delete(progressPhotos)
      .where(and(eq(progressPhotos.id, id), eq(progressPhotos.tenantId, tenantId)))
      .returning();

    return result.length > 0;
  }
}
