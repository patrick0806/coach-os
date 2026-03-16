import { Injectable } from "@nestjs/common";
import { and, eq, ilike, isNull, or, sql } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { exercises } from "@config/database/schema/exercises";

export type Exercise = InferSelectModel<typeof exercises>;

@Injectable()
export class ExercisesRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async create(data: {
    name: string;
    muscleGroup: string;
    tenantId: string;
    description?: string;
    instructions?: string;
    mediaUrl?: string;
    youtubeUrl?: string;
  }): Promise<Exercise> {
    const result = await this.drizzle.db
      .insert(exercises)
      .values(data)
      .returning();

    return result[0];
  }

  async findAllVisible(
    tenantId: string,
    opts: {
      page: number;
      size: number;
      search?: string;
      muscleGroup?: string;
    },
  ): Promise<{ rows: Exercise[]; total: number }> {
    const { page, size, search, muscleGroup } = opts;

    const conditions = and(
      or(isNull(exercises.tenantId), eq(exercises.tenantId, tenantId)),
      search ? ilike(exercises.name, `%${search}%`) : undefined,
      muscleGroup ? eq(exercises.muscleGroup, muscleGroup) : undefined,
    );

    const [rows, totalResult] = await Promise.all([
      this.drizzle.db
        .select()
        .from(exercises)
        .where(conditions)
        .limit(size)
        .offset(page * size),
      this.drizzle.db
        .select({ value: sql<number>`count(*)` })
        .from(exercises)
        .where(conditions),
    ]);

    return {
      rows,
      total: Number(totalResult[0]?.value ?? 0),
    };
  }

  async findById(id: string): Promise<Exercise | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(exercises)
      .where(eq(exercises.id, id))
      .limit(1);

    return result[0];
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<{
      name: string;
      muscleGroup: string;
      description: string | null;
      instructions: string | null;
      mediaUrl: string | null;
      youtubeUrl: string | null;
    }>,
  ): Promise<Exercise | undefined> {
    // Drizzle ORM type inference limitation: nullable columns not always inferred in SET type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await this.drizzle.db
      .update(exercises)
      .set(data as any)
      .where(and(eq(exercises.id, id), eq(exercises.tenantId, tenantId)))
      .returning();

    return result[0];
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.drizzle.db
      .delete(exercises)
      .where(and(eq(exercises.id, id), eq(exercises.tenantId, tenantId)));
  }
}
