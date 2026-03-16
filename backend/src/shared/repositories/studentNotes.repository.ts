import { Injectable } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { studentNotes } from "@config/database/schema/coaching";
import type { InferSelectModel } from "drizzle-orm";

export type StudentNote = InferSelectModel<typeof studentNotes>;

@Injectable()
export class StudentNotesRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async create(data: {
    tenantId: string;
    studentId: string;
    note: string;
  }): Promise<StudentNote> {
    const result = await this.drizzle.db
      .insert(studentNotes)
      .values(data)
      .returning();

    return result[0];
  }

  async findByStudentId(studentId: string, tenantId: string): Promise<StudentNote[]> {
    return this.drizzle.db
      .select()
      .from(studentNotes)
      .where(and(eq(studentNotes.studentId, studentId), eq(studentNotes.tenantId, tenantId)))
      .orderBy(desc(studentNotes.createdAt));
  }

  async findById(id: string, tenantId: string): Promise<StudentNote | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(studentNotes)
      .where(and(eq(studentNotes.id, id), eq(studentNotes.tenantId, tenantId)))
      .limit(1);

    return result[0];
  }

  async update(id: string, tenantId: string, note: string): Promise<StudentNote | undefined> {
    const result = await this.drizzle.db
      .update(studentNotes)
      .set({ note })
      .where(and(eq(studentNotes.id, id), eq(studentNotes.tenantId, tenantId)))
      .returning();

    return result[0];
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.drizzle.db
      .delete(studentNotes)
      .where(and(eq(studentNotes.id, id), eq(studentNotes.tenantId, tenantId)));
  }
}
