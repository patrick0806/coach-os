import { Injectable } from "@nestjs/common";
import { and, asc, eq, ilike, inArray, sql } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { programTemplates } from "@config/database/schema/training";
import { workoutTemplates } from "@config/database/schema/training";
import { exerciseTemplates } from "@config/database/schema/training";
import { exercises } from "@config/database/schema/exercises";

export type ProgramTemplate = InferSelectModel<typeof programTemplates>;
export type WorkoutTemplate = InferSelectModel<typeof workoutTemplates>;
export type ExerciseTemplate = InferSelectModel<typeof exerciseTemplates>;

export interface ExerciseTemplateWithExercise extends ExerciseTemplate {
  exercise: {
    id: string;
    name: string;
    muscleGroup: string;
    mediaUrl: string | null;
  };
}

export interface WorkoutTemplateWithExercises extends WorkoutTemplate {
  exerciseTemplates: ExerciseTemplateWithExercise[];
}

export interface ProgramTemplateWithTree extends ProgramTemplate {
  workoutTemplates: WorkoutTemplateWithExercises[];
}

@Injectable()
export class ProgramTemplatesRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async create(data: {
    tenantId: string;
    name: string;
    description?: string;
  }): Promise<ProgramTemplate> {
    const result = await this.drizzle.db
      .insert(programTemplates)
      .values({
        tenantId: data.tenantId,
        name: data.name,
        description: data.description,
        status: "active",
      })
      .returning();

    return result[0];
  }

  async findAllByTenantId(
    tenantId: string,
    opts: {
      page: number;
      size: number;
      search?: string;
      status?: string;
    },
  ): Promise<{ rows: ProgramTemplate[]; total: number }> {
    const { page, size, search, status } = opts;

    const conditions = and(
      eq(programTemplates.tenantId, tenantId),
      search ? ilike(programTemplates.name, `%${search}%`) : undefined,
      status ? eq(programTemplates.status, status as "active" | "archived") : undefined,
    );

    const [rows, totalResult] = await Promise.all([
      this.drizzle.db
        .select()
        .from(programTemplates)
        .where(conditions)
        .orderBy(asc(programTemplates.createdAt))
        .limit(size)
        .offset(page * size),
      this.drizzle.db
        .select({ value: sql<number>`count(*)` })
        .from(programTemplates)
        .where(conditions),
    ]);

    return {
      rows,
      total: Number(totalResult[0]?.value ?? 0),
    };
  }

  async findById(id: string, tenantId: string): Promise<ProgramTemplate | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(programTemplates)
      .where(and(eq(programTemplates.id, id), eq(programTemplates.tenantId, tenantId)))
      .limit(1);

    return result[0];
  }

  async findByIdWithTree(
    id: string,
    tenantId: string,
  ): Promise<ProgramTemplateWithTree | undefined> {
    // Step 1: fetch the program template
    const templateResult = await this.drizzle.db
      .select()
      .from(programTemplates)
      .where(and(eq(programTemplates.id, id), eq(programTemplates.tenantId, tenantId)))
      .limit(1);

    const template = templateResult[0];
    if (!template) return undefined;

    // Step 2: fetch workout templates ordered by order
    const workouts = await this.drizzle.db
      .select()
      .from(workoutTemplates)
      .where(eq(workoutTemplates.programTemplateId, id))
      .orderBy(asc(workoutTemplates.order));

    if (workouts.length === 0) {
      return { ...template, workoutTemplates: [] };
    }

    // Step 3: fetch exercise templates with exercise data for all workouts
    const workoutIds = workouts.map((w) => w.id);

    const exerciseRows = await this.drizzle.db
      .select({
        id: exerciseTemplates.id,
        workoutTemplateId: exerciseTemplates.workoutTemplateId,
        exerciseId: exerciseTemplates.exerciseId,
        sets: exerciseTemplates.sets,
        repetitions: exerciseTemplates.repetitions,
        restSeconds: exerciseTemplates.restSeconds,
        duration: exerciseTemplates.duration,
        order: exerciseTemplates.order,
        notes: exerciseTemplates.notes,
        createdAt: exerciseTemplates.createdAt,
        updatedAt: exerciseTemplates.updatedAt,
        exerciseName: exercises.name,
        exerciseMuscleGroup: exercises.muscleGroup,
        exerciseMediaUrl: exercises.mediaUrl,
      })
      .from(exerciseTemplates)
      .innerJoin(exercises, eq(exerciseTemplates.exerciseId, exercises.id))
      .where(inArray(exerciseTemplates.workoutTemplateId, workoutIds))
      .orderBy(asc(exerciseTemplates.order));

    // Step 4: compose tree in code
    const exercisesByWorkout = new Map<string, ExerciseTemplateWithExercise[]>();
    for (const row of exerciseRows) {
      const item: ExerciseTemplateWithExercise = {
        id: row.id,
        workoutTemplateId: row.workoutTemplateId,
        exerciseId: row.exerciseId,
        sets: row.sets,
        repetitions: row.repetitions,
        restSeconds: row.restSeconds,
        duration: row.duration,
        order: row.order,
        notes: row.notes,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        exercise: {
          id: row.exerciseId,
          name: row.exerciseName,
          muscleGroup: row.exerciseMuscleGroup,
          mediaUrl: row.exerciseMediaUrl ?? null,
        },
      };

      const existing = exercisesByWorkout.get(row.workoutTemplateId) ?? [];
      existing.push(item);
      exercisesByWorkout.set(row.workoutTemplateId, existing);
    }

    const workoutsWithExercises: WorkoutTemplateWithExercises[] = workouts.map((w) => ({
      ...w,
      exerciseTemplates: exercisesByWorkout.get(w.id) ?? [],
    }));

    return { ...template, workoutTemplates: workoutsWithExercises };
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<{
      name: string;
      description: string | null;
      status: string;
    }>,
  ): Promise<ProgramTemplate | undefined> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await this.drizzle.db
      .update(programTemplates)
      .set(data as any)
      .where(and(eq(programTemplates.id, id), eq(programTemplates.tenantId, tenantId)))
      .returning();

    return result[0];
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.drizzle.db
      .delete(programTemplates)
      .where(and(eq(programTemplates.id, id), eq(programTemplates.tenantId, tenantId)));
  }
}
