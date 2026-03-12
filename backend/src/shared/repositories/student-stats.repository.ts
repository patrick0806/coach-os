import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import { students } from "@config/database/schema/students";

type DrizzleDb = NodePgDatabase<typeof schema>;

export interface StudentStats {
  currentStreak: number;
  lastWorkoutDate: string | null;
  totalWorkouts: number;
}

export interface UpdateStudentStatsInput {
  currentStreak: number;
  lastWorkoutDate: string;
  totalWorkouts: number;
}

@Injectable()
export class StudentStatsRepository {
  constructor(private drizzle: DrizzleProvider) {}

  async findById(studentId: string, tx?: DrizzleDb): Promise<StudentStats | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select({
        currentStreak: students.currentStreak,
        lastWorkoutDate: students.lastWorkoutDate,
        totalWorkouts: students.totalWorkouts,
      })
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);
    return result[0] ?? null;
  }

  async updateStats(
    studentId: string,
    data: UpdateStudentStatsInput,
    tx?: DrizzleDb,
  ): Promise<void> {
    const db = tx ?? this.drizzle.db;
    await db
      .update(students)
      .set({
        currentStreak: data.currentStreak,
        lastWorkoutDate: data.lastWorkoutDate,
        totalWorkouts: data.totalWorkouts,
      } as any)
      .where(eq(students.id, studentId));
  }
}
