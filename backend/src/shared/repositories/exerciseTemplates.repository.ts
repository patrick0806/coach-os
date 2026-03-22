import { Injectable } from "@nestjs/common";
import { and, eq, max } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { DbTransaction, DrizzleProvider } from "@shared/providers/drizzle.service";
import {
  exerciseTemplates,
  workoutTemplates,
  programTemplates,
} from "@config/database/schema/training";

export type ExerciseTemplate = InferSelectModel<typeof exerciseTemplates>;

export interface ExerciseTemplateWithTenant extends ExerciseTemplate {
  tenantId: string;
}

@Injectable()
export class ExerciseTemplatesRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async create(data: {
    workoutTemplateId: string;
    exerciseId: string;
    sets: number;
    repetitions?: number;
    restSeconds?: number;
    duration?: string;
    order: number;
    notes?: string;
  }, tx?: DbTransaction): Promise<ExerciseTemplate> {
    const result = await (tx ?? this.drizzle.db)
      .insert(exerciseTemplates)
      .values(data)
      .returning();

    return result[0];
  }

  async findById(id: string): Promise<ExerciseTemplate | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(exerciseTemplates)
      .where(eq(exerciseTemplates.id, id))
      .limit(1);

    return result[0];
  }

  async findByIdWithTenant(id: string): Promise<ExerciseTemplateWithTenant | undefined> {
    const result = await this.drizzle.db
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
        tenantId: programTemplates.tenantId,
      })
      .from(exerciseTemplates)
      .innerJoin(
        workoutTemplates,
        eq(exerciseTemplates.workoutTemplateId, workoutTemplates.id),
      )
      .innerJoin(
        programTemplates,
        eq(workoutTemplates.programTemplateId, programTemplates.id),
      )
      .where(eq(exerciseTemplates.id, id))
      .limit(1);

    return result[0];
  }

  async findMaxOrderByWorkoutTemplateId(workoutTemplateId: string): Promise<number> {
    const result = await this.drizzle.db
      .select({ maxOrder: max(exerciseTemplates.order) })
      .from(exerciseTemplates)
      .where(eq(exerciseTemplates.workoutTemplateId, workoutTemplateId));

    return result[0]?.maxOrder ?? -1;
  }

  async update(
    id: string,
    data: Partial<{
      sets: number;
      repetitions: number | null;
      restSeconds: number | null;
      duration: string | null;
      notes: string | null;
      order: number;
    }>,
  ): Promise<ExerciseTemplate | undefined> {
     
    const result = await this.drizzle.db
      .update(exerciseTemplates)
      .set(data as any)
      .where(eq(exerciseTemplates.id, id))
      .returning();

    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.drizzle.db
      .delete(exerciseTemplates)
      .where(eq(exerciseTemplates.id, id));
  }

  async reorder(workoutTemplateId: string, items: { id: string; order: number }[]): Promise<void> {
    await this.drizzle.db.transaction(async (tx) => {
      for (const item of items) {
        await tx
          .update(exerciseTemplates)
          .set({ order: item.order })
          .where(
            and(
              eq(exerciseTemplates.id, item.id),
              eq(exerciseTemplates.workoutTemplateId, workoutTemplateId),
            ),
          );
      }
    });
  }
}
