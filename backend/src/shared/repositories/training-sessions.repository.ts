import { Injectable } from "@nestjs/common";
import { and, eq, gte, lte } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import {
  trainingSessions,
  TrainingSession,
  NewTrainingSession,
} from "@config/database/schema/schedule";

type DrizzleDb = NodePgDatabase<typeof schema>;

export interface CreateTrainingSessionInput {
  personalId: string;
  studentId: string;
  scheduleRuleId: string;
  workoutPlanId?: string | null;
  scheduledDate: string;
  scheduledTime?: string | null;
  status: "pending" | "completed" | "cancelled";
  sessionType: "presential" | "online" | "rest";
}

@Injectable()
export class TrainingSessionsRepository {
  constructor(private drizzle: DrizzleProvider) {}

  // Bulk insert — skips rows that would violate the unique constraint (idempotent)
  async createManyIgnoreDuplicates(
    data: CreateTrainingSessionInput[],
    tx?: DrizzleDb,
  ): Promise<TrainingSession[]> {
    if (data.length === 0) return [];

    const db = tx ?? this.drizzle.db;
    return (db as any)
      .insert(trainingSessions)
      .values(data as NewTrainingSession[])
      .onConflictDoNothing()
      .returning();
  }

  // Deletes all PENDING future sessions generated from a given rule (used on rule sync)
  async deletePendingFutureByRule(ruleId: string, tx?: DrizzleDb): Promise<void> {
    const db = tx ?? this.drizzle.db;
    const today = new Date().toISOString().split("T")[0];
    await (db as any)
      .delete(trainingSessions)
      .where(
        and(
          eq(trainingSessions.scheduleRuleId, ruleId),
          eq(trainingSessions.status, "pending"),
          gte(trainingSessions.scheduledDate, today),
        ),
      );
  }

  async findByStudentAndDateRange(
    studentId: string,
    personalId: string,
    from: string,
    to: string,
    tx?: DrizzleDb,
  ): Promise<TrainingSession[]> {
    const db = tx ?? this.drizzle.db;
    return db
      .select()
      .from(trainingSessions)
      .where(
        and(
          eq(trainingSessions.studentId, studentId),
          eq(trainingSessions.personalId, personalId),
          gte(trainingSessions.scheduledDate, from),
        ),
      );
  }

  async findById(id: string, tx?: DrizzleDb): Promise<TrainingSession | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select()
      .from(trainingSessions)
      .where(eq(trainingSessions.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findTodayByStudent(studentId: string, tx?: DrizzleDb): Promise<TrainingSession | null> {
    const db = tx ?? this.drizzle.db;
    const today = new Date().toISOString().split("T")[0];
    const result = await db
      .select()
      .from(trainingSessions)
      .where(
        and(
          eq(trainingSessions.studentId, studentId),
          eq(trainingSessions.scheduledDate, today),
        ),
      )
      .limit(1);
    return result[0] ?? null;
  }

  async findWeekByStudent(studentId: string, tx?: DrizzleDb): Promise<TrainingSession[]> {
    const db = tx ?? this.drizzle.db;
    const today = new Date().toISOString().split("T")[0];
    const end = new Date();
    end.setDate(end.getDate() + 7);
    const endStr = end.toISOString().split("T")[0];

    return db
      .select()
      .from(trainingSessions)
      .where(
        and(
          eq(trainingSessions.studentId, studentId),
          gte(trainingSessions.scheduledDate, today),
          lte(trainingSessions.scheduledDate, endStr),
        ),
      );
  }

  async findByStudent(studentId: string, tx?: DrizzleDb): Promise<TrainingSession[]> {
    const db = tx ?? this.drizzle.db;
    return db
      .select()
      .from(trainingSessions)
      .where(eq(trainingSessions.studentId, studentId));
  }

  async findHistoryByStudent(
    studentId: string,
    fromDate: string,
    toDate: string,
    tx?: DrizzleDb,
  ): Promise<TrainingSession[]> {
    const db = tx ?? this.drizzle.db;
    return db
      .select()
      .from(trainingSessions)
      .where(
        and(
          eq(trainingSessions.studentId, studentId),
          gte(trainingSessions.scheduledDate, fromDate),
          lte(trainingSessions.scheduledDate, toDate),
        ),
      )
      .orderBy(trainingSessions.scheduledDate);
  }

  async updateStatus(
    id: string,
    status: "completed" | "cancelled",
    extras: { cancelledAt?: Date; cancellationReason?: string; workoutSessionId?: string } = {},
    tx?: DrizzleDb,
  ): Promise<TrainingSession | null> {
    const db = tx ?? this.drizzle.db;
    const result = await (db as any)
      .update(trainingSessions)
      .set({ status, updatedAt: new Date(), ...extras })
      .where(eq(trainingSessions.id, id))
      .returning();
    return result[0] ?? null;
  }
}
