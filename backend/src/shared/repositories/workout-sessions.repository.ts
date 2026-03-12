import { Injectable } from "@nestjs/common";
import { eq, and } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import { workoutSessions, WorkoutSession } from "@config/database/schema/workout";

type DrizzleDb = NodePgDatabase<typeof schema>;

@Injectable()
export class WorkoutSessionsRepository {
  constructor(private drizzle: DrizzleProvider) {}

  async findActiveByStudentAndPlan(
    studentId: string,
    workoutPlanId: string,
    tx?: DrizzleDb,
  ): Promise<WorkoutSession | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select()
      .from(workoutSessions)
      .where(
        and(
          eq(workoutSessions.studentId, studentId),
          eq(workoutSessions.workoutPlanId, workoutPlanId),
          eq(workoutSessions.status, "active"),
        ),
      )
      .limit(1);
    return result[0] ?? null;
  }

  async findByIdAndStudent(
    id: string,
    studentId: string,
    tx?: DrizzleDb,
  ): Promise<WorkoutSession | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select()
      .from(workoutSessions)
      .where(and(eq(workoutSessions.id, id), eq(workoutSessions.studentId, studentId)))
      .limit(1);
    return result[0] ?? null;
  }

  async create(
    data: { studentId: string; workoutPlanId: string },
    tx?: DrizzleDb,
  ): Promise<WorkoutSession> {
    const db = tx ?? this.drizzle.db;
    const result = await db.insert(workoutSessions).values(data).returning();
    return result[0];
  }

  async updateStep(
    id: string,
    studentId: string,
    currentStep: number,
    tx?: DrizzleDb,
  ): Promise<WorkoutSession | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .update(workoutSessions)
      .set({ currentStep })
      .where(and(eq(workoutSessions.id, id), eq(workoutSessions.studentId, studentId)))
      .returning();
    return result[0] ?? null;
  }

  async complete(
    id: string,
    studentId: string,
    tx?: DrizzleDb,
  ): Promise<WorkoutSession | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .update(workoutSessions)
      .set({ status: "completed", completedAt: new Date() })
      .where(and(eq(workoutSessions.id, id), eq(workoutSessions.studentId, studentId)))
      .returning();
    return result[0] ?? null;
  }
}
