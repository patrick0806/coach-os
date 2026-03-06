import { Injectable } from "@nestjs/common";
import { and, asc, count, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import {
  workoutPlans,
  WorkoutPlan,
  workoutExercises,
  exercises,
} from "@config/database/schema/workout";
import { WorkoutExerciseRow } from "./workout-exercises.repository";

type DrizzleDb = NodePgDatabase<typeof schema>;

export interface CreateWorkoutPlanInput {
  personalId: string;
  name: string;
  description?: string | null;
}

export interface UpdateWorkoutPlanInput {
  name?: string;
  description?: string | null;
}

export interface WorkoutPlanDetail extends WorkoutPlan {
  exercises: WorkoutExerciseRow[];
}

export interface PaginatedWorkoutPlans {
  content: WorkoutPlan[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

@Injectable()
export class WorkoutPlansRepository {
  constructor(private drizzle: DrizzleProvider) {}

  async findAll(
    tenantId: string,
    options: { page: number; size: number },
    tx?: DrizzleDb,
  ): Promise<PaginatedWorkoutPlans> {
    const db = tx ?? this.drizzle.db;
    const { page, size } = options;
    const offset = (page - 1) * size;
    const tenantFilter = eq(workoutPlans.personalId, tenantId);

    const [rows, countResult] = await Promise.all([
      db
        .select()
        .from(workoutPlans)
        .where(tenantFilter)
        .orderBy(workoutPlans.createdAt)
        .limit(size)
        .offset(offset),
      db.select({ total: count() }).from(workoutPlans).where(tenantFilter),
    ]);

    const totalElements = Number(countResult[0].total);

    return {
      content: rows,
      page,
      size,
      totalElements,
      totalPages: Math.ceil(totalElements / size),
    };
  }

  async findById(
    id: string,
    tenantId: string,
    tx?: DrizzleDb,
  ): Promise<WorkoutPlanDetail | null> {
    const db = tx ?? this.drizzle.db;

    const rows = await db
      .select({
        plan: workoutPlans,
        we: {
          id: workoutExercises.id,
          exerciseId: workoutExercises.exerciseId,
          sets: workoutExercises.sets,
          repetitions: workoutExercises.repetitions,
          load: workoutExercises.load,
          order: workoutExercises.order,
          notes: workoutExercises.notes,
        },
        ex: {
          name: exercises.name,
          muscleGroup: exercises.muscleGroup,
        },
      })
      .from(workoutPlans)
      .leftJoin(workoutExercises, eq(workoutExercises.workoutPlanId, workoutPlans.id))
      .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
      .where(and(eq(workoutPlans.id, id), eq(workoutPlans.personalId, tenantId)))
      .orderBy(asc(workoutExercises.order));

    if (rows.length === 0) return null;

    const plan = rows[0].plan;
    const exerciseRows: WorkoutExerciseRow[] = rows
      .filter((r) => r.we.id !== null)
      .map((r) => ({
        id: r.we.id!,
        exerciseId: r.we.exerciseId!,
        exerciseName: r.ex.name!,
        muscleGroup: r.ex.muscleGroup!,
        sets: r.we.sets!,
        repetitions: r.we.repetitions!,
        load: r.we.load ?? null,
        order: r.we.order!,
        notes: r.we.notes ?? null,
      }));

    return { ...plan, exercises: exerciseRows };
  }

  async create(data: CreateWorkoutPlanInput, tx?: DrizzleDb): Promise<WorkoutPlan> {
    const db = tx ?? this.drizzle.db;
    // Cast needed: Drizzle v0.39 $inferInsert narrowing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await db.insert(workoutPlans).values(data as any).returning();
    return result[0];
  }

  async update(
    id: string,
    tenantId: string,
    data: UpdateWorkoutPlanInput,
    tx?: DrizzleDb,
  ): Promise<WorkoutPlan | null> {
    const db = tx ?? this.drizzle.db;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await db
      .update(workoutPlans)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .set(data as any)
      .where(and(eq(workoutPlans.id, id), eq(workoutPlans.personalId, tenantId)))
      .returning();
    return result[0] ?? null;
  }

  async delete(id: string, tenantId: string, tx?: DrizzleDb): Promise<void> {
    const db = tx ?? this.drizzle.db;
    await db
      .delete(workoutPlans)
      .where(and(eq(workoutPlans.id, id), eq(workoutPlans.personalId, tenantId)));
  }
}
