import { Injectable } from "@nestjs/common";
import { eq, sql } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import {
  exerciseExecutions,
  workoutSessions,
} from "@config/database/schema/workoutExecution";

export type ExerciseExecution = InferSelectModel<typeof exerciseExecutions>;

export interface ExerciseExecutionWithTenant extends ExerciseExecution {
  tenantId: string;
}

@Injectable()
export class ExerciseExecutionsRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async create(data: {
    workoutSessionId: string;
    studentExerciseId: string;
    exerciseId: string;
    order: number;
  }): Promise<ExerciseExecution> {
    const result = await this.drizzle.db
      .insert(exerciseExecutions)
      .values(data)
      .returning();

    return result[0];
  }

  async findByIdWithTenant(id: string): Promise<ExerciseExecutionWithTenant | undefined> {
    const result = await this.drizzle.db
      .select({
        id: exerciseExecutions.id,
        workoutSessionId: exerciseExecutions.workoutSessionId,
        studentExerciseId: exerciseExecutions.studentExerciseId,
        exerciseId: exerciseExecutions.exerciseId,
        order: exerciseExecutions.order,
        startedAt: exerciseExecutions.startedAt,
        finishedAt: exerciseExecutions.finishedAt,
        createdAt: exerciseExecutions.createdAt,
        updatedAt: exerciseExecutions.updatedAt,
        tenantId: workoutSessions.tenantId,
      })
      .from(exerciseExecutions)
      .innerJoin(
        workoutSessions,
        eq(exerciseExecutions.workoutSessionId, workoutSessions.id),
      )
      .where(eq(exerciseExecutions.id, id))
      .limit(1);

    return result[0];
  }

  async findMaxOrderBySessionId(sessionId: string): Promise<number> {
    const result = await this.drizzle.db
      .select({ maxOrder: sql<number>`COALESCE(MAX(${exerciseExecutions.order}), 0)` })
      .from(exerciseExecutions)
      .where(eq(exerciseExecutions.workoutSessionId, sessionId));

    return Number(result[0]?.maxOrder ?? 0);
  }
}
