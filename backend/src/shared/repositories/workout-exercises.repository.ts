import { Injectable } from "@nestjs/common";
import { and, asc, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import {
  workoutExercises,
  WorkoutExercise,
  exercises,
} from "@config/database/schema/workout";
type DrizzleDb = NodePgDatabase<typeof schema>;

export interface WorkoutExerciseRow {
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  exercisedbGifUrl: string | null;
  youtubeUrl: string | null;
  sets: number;
  repetitions: number;
  load: string | null;
  order: number;
  notes: string | null;
}

export interface CreateWorkoutExerciseInput {
  workoutPlanId: string;
  exerciseId: string;
  sets: number;
  repetitions: number;
  load?: string | null;
  order?: number;
  notes?: string | null;
}

export interface ReorderItem {
  id: string;
  order: number;
}

@Injectable()
export class WorkoutExercisesRepository {
  constructor(private drizzle: DrizzleProvider) {}

  async findByWorkoutPlanId(
    workoutPlanId: string,
    tx?: DrizzleDb,
  ): Promise<WorkoutExerciseRow[]> {
    const db = tx ?? this.drizzle.db;
    const rows = await db
      .select({
        id: workoutExercises.id,
        exerciseId: workoutExercises.exerciseId,
        exerciseName: exercises.name,
        muscleGroup: exercises.muscleGroup,
        exercisedbGifUrl: exercises.exercisedbGifUrl,
        youtubeUrl: exercises.youtubeUrl,
        sets: workoutExercises.sets,
        repetitions: workoutExercises.repetitions,
        load: workoutExercises.load,
        order: workoutExercises.order,
        notes: workoutExercises.notes,
      })
      .from(workoutExercises)
      .innerJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
      .where(eq(workoutExercises.workoutPlanId, workoutPlanId))
      .orderBy(asc(workoutExercises.order));
    return rows;
  }

  async findById(id: string, tx?: DrizzleDb): Promise<WorkoutExercise | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select()
      .from(workoutExercises)
      .where(eq(workoutExercises.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async create(
    data: CreateWorkoutExerciseInput,
    tx?: DrizzleDb,
  ): Promise<WorkoutExerciseRow> {
    const db = tx ?? this.drizzle.db;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inserted = await db.insert(workoutExercises).values(data as any).returning();
    const we = inserted[0];

    // Fetch exercise details to return full row
    const exerciseRows = await db
      .select({
        name: exercises.name,
        muscleGroup: exercises.muscleGroup,
        exercisedbGifUrl: exercises.exercisedbGifUrl,
        youtubeUrl: exercises.youtubeUrl,
      })
      .from(exercises)
      .where(eq(exercises.id, we.exerciseId))
      .limit(1);

    return {
      id: we.id,
      exerciseId: we.exerciseId,
      exerciseName: exerciseRows[0].name,
      muscleGroup: exerciseRows[0].muscleGroup,
      exercisedbGifUrl: exerciseRows[0].exercisedbGifUrl ?? null,
      youtubeUrl: exerciseRows[0].youtubeUrl ?? null,
      sets: we.sets,
      repetitions: we.repetitions,
      load: we.load ?? null,
      order: we.order,
      notes: we.notes ?? null,
    };
  }

  async deleteById(id: string, workoutPlanId: string, tx?: DrizzleDb): Promise<void> {
    const db = tx ?? this.drizzle.db;
    await db
      .delete(workoutExercises)
      .where(
        and(
          eq(workoutExercises.id, id),
          eq(workoutExercises.workoutPlanId, workoutPlanId),
        ),
      );
  }

  async reorder(items: ReorderItem[], tx?: DrizzleDb): Promise<void> {
    const db = tx ?? this.drizzle.db;
    await db.transaction(async (trx) => {
      for (const item of items) {
        // Cast needed: Drizzle v0.39 $inferUpdate narrowing excludes nullable/default columns
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await trx
          .update(workoutExercises)
          .set({ order: item.order } as any)
          .where(eq(workoutExercises.id, item.id));
      }
    });
  }
}
