import { Injectable } from "@nestjs/common";
import { and, count, desc, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import {
  studentNotes,
  StudentNote,
  NewStudentNote,
} from "@config/database/schema/students";

type DrizzleDb = NodePgDatabase<typeof schema>;

export interface StudentNoteListItem {
  id: string;
  studentId: string;
  personalId: string;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedStudentNotes {
  items: StudentNoteListItem[];
  page: number;
  size: number;
  total: number;
}

@Injectable()
export class StudentNotesRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async create(data: NewStudentNote, tx?: DrizzleDb): Promise<StudentNote> {
    const db = tx ?? this.drizzle.db;
    const result = await db.insert(studentNotes).values(data).returning();
    return result[0];
  }

  async findById(id: string, tx?: DrizzleDb): Promise<StudentNote | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select()
      .from(studentNotes)
      .where(eq(studentNotes.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async findByStudentId(
    studentId: string,
    personalId: string,
    options: { page: number; size: number },
    tx?: DrizzleDb,
  ): Promise<PaginatedStudentNotes> {
    const db = tx ?? this.drizzle.db;
    const { page, size } = options;
    const offset = (page - 1) * size;
    const where = and(
      eq(studentNotes.studentId, studentId),
      eq(studentNotes.personalId, personalId),
    );

    const [items, totalResult] = await Promise.all([
      db
        .select({
          id: studentNotes.id,
          studentId: studentNotes.studentId,
          personalId: studentNotes.personalId,
          note: studentNotes.note,
          createdAt: studentNotes.createdAt,
          updatedAt: studentNotes.updatedAt,
        })
        .from(studentNotes)
        .where(where)
        .orderBy(desc(studentNotes.createdAt))
        .limit(size)
        .offset(offset),
      db.select({ total: count() }).from(studentNotes).where(where),
    ]);

    return {
      items,
      page,
      size,
      total: Number(totalResult[0].total),
    };
  }

  async update(id: string, note: string, personalId: string, tx?: DrizzleDb): Promise<StudentNote | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .update(studentNotes)
      .set({ note })
      .where(and(eq(studentNotes.id, id), eq(studentNotes.personalId, personalId)))
      .returning();

    return result[0] ?? null;
  }

  async delete(id: string, personalId: string, tx?: DrizzleDb): Promise<void> {
    const db = tx ?? this.drizzle.db;
    await db
      .delete(studentNotes)
      .where(and(eq(studentNotes.id, id), eq(studentNotes.personalId, personalId)));
  }
}
