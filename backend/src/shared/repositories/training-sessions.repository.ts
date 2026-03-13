import { Injectable } from "@nestjs/common";
import { and, eq, gte, lte } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { getTodayInBrazil } from "@shared/utils";
import * as schema from "@config/database/schema";
import {
  trainingSessions,
  TrainingSession,
  NewTrainingSession,
} from "@config/database/schema/schedule";
import { students } from "@config/database/schema/students";
import { users } from "@config/database/schema/users";

export interface TrainingSessionWithStudent extends TrainingSession {
  studentName: string;
}

type DrizzleDb = NodePgDatabase<typeof schema>;

export interface CreateTrainingSessionInput {
  personalId: string;
  studentId: string;
  scheduleRuleId: string;
  workoutPlanId?: string | null;
  scheduledDate: string;
  startTime?: string | null;
  endTime?: string | null;
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
    const today = getTodayInBrazil();
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
          eq(trainingSessions.personalId, personalId),
          eq(trainingSessions.studentId, studentId),
          gte(trainingSessions.scheduledDate, from),
          lte(trainingSessions.scheduledDate, to),
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

  async findTodayByStudent(studentId: string, personalId: string, tx?: DrizzleDb): Promise<TrainingSession | null> {
    const db = tx ?? this.drizzle.db;
    const today = getTodayInBrazil();
    const result = await db
      .select()
      .from(trainingSessions)
      .where(
        and(
          eq(trainingSessions.personalId, personalId),
          eq(trainingSessions.studentId, studentId),
          eq(trainingSessions.scheduledDate, today),
        ),
      )
      .limit(1);
    return result[0] ?? null;
  }

  async findWeekByStudent(studentId: string, personalId: string, tx?: DrizzleDb): Promise<TrainingSession[]> {
    const db = tx ?? this.drizzle.db;
    const today = getTodayInBrazil();
    const endDate = new Date(today + "T00:00:00Z");
    endDate.setUTCDate(endDate.getUTCDate() + 7);
    const endStr = endDate.toISOString().split("T")[0];

    return db
      .select()
      .from(trainingSessions)
      .where(
        and(
          eq(trainingSessions.personalId, personalId),
          eq(trainingSessions.studentId, studentId),
          gte(trainingSessions.scheduledDate, today),
          lte(trainingSessions.scheduledDate, endStr),
        ),
      );
  }

  async findByStudent(studentId: string, personalId: string, tx?: DrizzleDb): Promise<TrainingSession[]> {
    const db = tx ?? this.drizzle.db;
    return db
      .select()
      .from(trainingSessions)
      .where(
        and(
          eq(trainingSessions.personalId, personalId),
          eq(trainingSessions.studentId, studentId),
        ),
      );
  }

  async findHistoryByStudent(
    studentId: string,
    personalId: string,
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
          eq(trainingSessions.personalId, personalId),
          eq(trainingSessions.studentId, studentId),
          gte(trainingSessions.scheduledDate, fromDate),
          lte(trainingSessions.scheduledDate, toDate),
        ),
      )
      .orderBy(trainingSessions.scheduledDate);
  }

  // Returns all sessions for a personal in a date range, joined with student name.
  // Used by the personal calendar view to see all students' sessions in one week.
  async findByPersonalAndDateRange(
    personalId: string,
    from: string,
    to: string,
    tx?: DrizzleDb,
  ): Promise<TrainingSessionWithStudent[]> {
    const db = tx ?? this.drizzle.db;
    const rows = await db
      .select({
        id: trainingSessions.id,
        personalId: trainingSessions.personalId,
        studentId: trainingSessions.studentId,
        scheduleRuleId: trainingSessions.scheduleRuleId,
        workoutPlanId: trainingSessions.workoutPlanId,
        workoutSessionId: trainingSessions.workoutSessionId,
        scheduledDate: trainingSessions.scheduledDate,
        startTime: trainingSessions.startTime,
        endTime: trainingSessions.endTime,
        status: trainingSessions.status,
        sessionType: trainingSessions.sessionType,
        cancelledAt: trainingSessions.cancelledAt,
        cancellationReason: trainingSessions.cancellationReason,
        notes: trainingSessions.notes,
        createdAt: trainingSessions.createdAt,
        updatedAt: trainingSessions.updatedAt,
        studentName: users.name,
      })
      .from(trainingSessions)
      .innerJoin(students, eq(trainingSessions.studentId, students.id))
      .innerJoin(users, eq(students.userId, users.id))
      .where(
        and(
          eq(trainingSessions.personalId, personalId),
          gte(trainingSessions.scheduledDate, from),
          lte(trainingSessions.scheduledDate, to),
        ),
      )
      .orderBy(trainingSessions.scheduledDate, trainingSessions.startTime);
    return rows as TrainingSessionWithStudent[];
  }

  async updateStatus(
    id: string,
    status: "completed" | "cancelled",
    personalId: string,
    extras: { cancelledAt?: Date; cancellationReason?: string; workoutSessionId?: string } = {},
    tx?: DrizzleDb,
  ): Promise<TrainingSession | null> {
    const db = tx ?? this.drizzle.db;
    const result = await (db as any)
      .update(trainingSessions)
      .set({ status, updatedAt: new Date(), ...extras })
      .where(
        and(
          eq(trainingSessions.id, id),
          eq(trainingSessions.personalId, personalId),
        ),
      )
      .returning();
    return result[0] ?? null;
  }
}
