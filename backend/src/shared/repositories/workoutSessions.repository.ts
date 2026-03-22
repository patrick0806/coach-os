import { Injectable } from "@nestjs/common";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import {
  workoutSessions,
  exerciseExecutions,
  exerciseSets,
} from "@config/database/schema/workoutExecution";

export type WorkoutSession = InferSelectModel<typeof workoutSessions>;

export interface ExerciseSetData {
  id: string;
  exerciseExecutionId: string;
  setNumber: number;
  plannedReps: number | null;
  performedReps: number | null;
  plannedWeight: string | null;
  usedWeight: string | null;
  restSeconds: number | null;
  completionStatus: "completed" | "partial" | "skipped";
  createdAt: Date | null;
}

export interface ExerciseExecutionWithSets {
  id: string;
  workoutSessionId: string;
  studentExerciseId: string;
  exerciseId: string;
  order: number;
  startedAt: Date | null;
  finishedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  exerciseSets: ExerciseSetData[];
}

export interface WorkoutSessionWithExecutions extends WorkoutSession {
  exerciseExecutions: ExerciseExecutionWithSets[];
}

@Injectable()
export class WorkoutSessionsRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async create(data: {
    tenantId: string;
    studentId: string;
    workoutDayId: string;
    startedAt: Date;
  }): Promise<WorkoutSession> {
    const result = await this.drizzle.db
      .insert(workoutSessions)
      .values({
        tenantId: data.tenantId,
        studentId: data.studentId,
        workoutDayId: data.workoutDayId,
        startedAt: data.startedAt,
        status: "started",
      })
      .returning();

    return result[0];
  }

  async findById(id: string, tenantId: string): Promise<WorkoutSession | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(workoutSessions)
      .where(and(eq(workoutSessions.id, id), eq(workoutSessions.tenantId, tenantId)))
      .limit(1);

    return result[0];
  }

  async findByIdWithExecutions(
    id: string,
    tenantId: string,
  ): Promise<WorkoutSessionWithExecutions | undefined> {
    // Step 1: fetch the session
    const sessionResult = await this.drizzle.db
      .select()
      .from(workoutSessions)
      .where(and(eq(workoutSessions.id, id), eq(workoutSessions.tenantId, tenantId)))
      .limit(1);

    const session = sessionResult[0];
    if (!session) return undefined;

    // Step 2: fetch exercise executions ordered by order
    const executions = await this.drizzle.db
      .select()
      .from(exerciseExecutions)
      .where(eq(exerciseExecutions.workoutSessionId, id))
      .orderBy(asc(exerciseExecutions.order));

    if (executions.length === 0) {
      return { ...session, exerciseExecutions: [] };
    }

    // Step 3: fetch exercise sets for all executions
    const executionIds = executions.map((e) => e.id);
    const sets = await this.drizzle.db
      .select()
      .from(exerciseSets)
      .where(inArray(exerciseSets.exerciseExecutionId, executionIds))
      .orderBy(asc(exerciseSets.setNumber));

    // Step 4: compose tree in code
    const setsByExecution = new Map<string, ExerciseSetData[]>();
    for (const set of sets) {
      const item: ExerciseSetData = {
        id: set.id,
        exerciseExecutionId: set.exerciseExecutionId,
        setNumber: set.setNumber,
        plannedReps: set.plannedReps,
        performedReps: set.performedReps,
        plannedWeight: set.plannedWeight,
        usedWeight: set.usedWeight,
        restSeconds: set.restSeconds,
        completionStatus: set.completionStatus,
        createdAt: set.createdAt,
      };
      const existing = setsByExecution.get(set.exerciseExecutionId) ?? [];
      existing.push(item);
      setsByExecution.set(set.exerciseExecutionId, existing);
    }

    const executionsWithSets: ExerciseExecutionWithSets[] = executions.map((e) => ({
      id: e.id,
      workoutSessionId: e.workoutSessionId,
      studentExerciseId: e.studentExerciseId,
      exerciseId: e.exerciseId,
      order: e.order,
      startedAt: e.startedAt,
      finishedAt: e.finishedAt,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      exerciseSets: setsByExecution.get(e.id) ?? [],
    }));

    return { ...session, exerciseExecutions: executionsWithSets };
  }

  async hasActiveSession(studentId: string, tenantId: string): Promise<boolean> {
    const result = await this.drizzle.db
      .select({ value: sql<number>`count(*)` })
      .from(workoutSessions)
      .where(
        and(
          eq(workoutSessions.studentId, studentId),
          eq(workoutSessions.tenantId, tenantId),
          inArray(workoutSessions.status, ["started", "paused"]),
        ),
      );

    return Number(result[0]?.value ?? 0) > 0;
  }

  async findAllByStudentId(
    studentId: string,
    tenantId: string,
    opts: { page: number; size: number; status?: string },
  ): Promise<{ rows: WorkoutSession[]; total: number }> {
    const { page, size, status } = opts;

    const conditions = and(
      eq(workoutSessions.studentId, studentId),
      eq(workoutSessions.tenantId, tenantId),
      status
        ? eq(workoutSessions.status, status as "started" | "paused" | "finished" | "skipped")
        : undefined,
    );

    const [rows, totalResult] = await Promise.all([
      this.drizzle.db
        .select()
        .from(workoutSessions)
        .where(conditions)
        .orderBy(asc(workoutSessions.createdAt))
        .limit(size)
        .offset(page * size),
      this.drizzle.db
        .select({ value: sql<number>`count(*)` })
        .from(workoutSessions)
        .where(conditions),
    ]);

    return {
      rows,
      total: Number(totalResult[0]?.value ?? 0),
    };
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<{ status: "started" | "paused" | "finished" | "skipped"; finishedAt: Date }>,
  ): Promise<WorkoutSession | undefined> {
     
    const result = await this.drizzle.db
      .update(workoutSessions)
      .set(data as any)
      .where(and(eq(workoutSessions.id, id), eq(workoutSessions.tenantId, tenantId)))
      .returning();

    return result[0];
  }
}
