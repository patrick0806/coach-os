import { Injectable } from "@nestjs/common";
import { and, eq, ilike, isNull, or } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import { exercises, Exercise } from "@config/database/schema/workout";
import { workoutExercises } from "@config/database/schema/workout";

type DrizzleDb = NodePgDatabase<typeof schema>;

export interface CreateExerciseInput {
  name: string;
  description?: string | null;
  muscleGroup: string;
  personalId: string;
}

export interface FindAllExercisesOptions {
  muscleGroup?: string;
  search?: string;
}

@Injectable()
export class ExercisesRepository {
  constructor(private drizzle: DrizzleProvider) {}

  async findAll(
    tenantId: string,
    options: FindAllExercisesOptions = {},
    tx?: DrizzleDb,
  ): Promise<Exercise[]> {
    const db = tx ?? this.drizzle.db;

    const tenantFilter = or(
      isNull(exercises.personalId),
      eq(exercises.personalId, tenantId),
    );

    const muscleGroupFilter = options.muscleGroup
      ? eq(exercises.muscleGroup, options.muscleGroup)
      : undefined;

    const searchFilter = options.search
      ? ilike(exercises.name, `%${options.search}%`)
      : undefined;

    return db
      .select()
      .from(exercises)
      .where(and(tenantFilter, muscleGroupFilter, searchFilter))
      .orderBy(exercises.muscleGroup, exercises.name);
  }

  async findById(id: string, tx?: DrizzleDb): Promise<Exercise | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select()
      .from(exercises)
      .where(eq(exercises.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findOwnedById(
    id: string,
    tenantId: string,
    tx?: DrizzleDb,
  ): Promise<Exercise | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select()
      .from(exercises)
      .where(and(eq(exercises.id, id), eq(exercises.personalId, tenantId)))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: CreateExerciseInput, tx?: DrizzleDb): Promise<Exercise> {
    const db = tx ?? this.drizzle.db;
     
    const result = await db.insert(exercises).values(data as any).returning();
    return result[0];
  }

  async updateYoutubeUrl(
    exerciseId: string,
    youtubeUrl: string | null,
    tx?: DrizzleDb,
  ): Promise<void> {
    const db = tx ?? this.drizzle.db;
    await db
      .update(exercises)
       
      .set({ youtubeUrl } as any)
      .where(eq(exercises.id, exerciseId));
  }

  async isInUse(id: string, tx?: DrizzleDb): Promise<boolean> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select({ id: workoutExercises.id })
      .from(workoutExercises)
      .where(eq(workoutExercises.exerciseId, id))
      .limit(1);
    return result.length > 0;
  }

  async delete(id: string, tx?: DrizzleDb): Promise<void> {
    const db = tx ?? this.drizzle.db;
    await db.delete(exercises).where(eq(exercises.id, id));
  }
}
