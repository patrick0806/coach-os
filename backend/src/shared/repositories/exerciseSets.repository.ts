import { Injectable } from "@nestjs/common";
import { and, asc, eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import {
  exerciseSets,
  exerciseExecutions,
  workoutSessions,
} from "@config/database/schema/workoutExecution";

export type ExerciseSet = InferSelectModel<typeof exerciseSets>;

@Injectable()
export class ExerciseSetsRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async create(data: {
    exerciseExecutionId: string;
    setNumber: number;
    plannedReps?: number;
    performedReps?: number;
    plannedWeight?: string;
    usedWeight?: string;
    restSeconds?: number;
    completionStatus: "completed" | "partial" | "skipped";
  }): Promise<ExerciseSet> {
     
    const result = await this.drizzle.db
      .insert(exerciseSets)
      .values(data as any)
      .returning();

    return result[0];
  }

  async findByExecutionId(executionId: string, tenantId: string): Promise<ExerciseSet[]> {
    // Validate via join chain: exerciseSets → exerciseExecutions → workoutSessions (tenantId)
    const rows = await this.drizzle.db
      .select({
        id: exerciseSets.id,
        exerciseExecutionId: exerciseSets.exerciseExecutionId,
        setNumber: exerciseSets.setNumber,
        plannedReps: exerciseSets.plannedReps,
        performedReps: exerciseSets.performedReps,
        plannedWeight: exerciseSets.plannedWeight,
        usedWeight: exerciseSets.usedWeight,
        restSeconds: exerciseSets.restSeconds,
        completionStatus: exerciseSets.completionStatus,
        createdAt: exerciseSets.createdAt,
      })
      .from(exerciseSets)
      .innerJoin(
        exerciseExecutions,
        eq(exerciseSets.exerciseExecutionId, exerciseExecutions.id),
      )
      .innerJoin(
        workoutSessions,
        eq(exerciseExecutions.workoutSessionId, workoutSessions.id),
      )
      .where(
        and(
          eq(exerciseSets.exerciseExecutionId, executionId),
          eq(workoutSessions.tenantId, tenantId),
        ),
      )
      .orderBy(asc(exerciseSets.setNumber));

    return rows;
  }
}
