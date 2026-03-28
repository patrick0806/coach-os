import { Injectable } from "@nestjs/common";
import { and, eq, max } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { DbTransaction, DrizzleProvider } from "@shared/providers/drizzle.service";
import { studentExercises, workoutDays, studentPrograms } from "@config/database/schema/training";

export type StudentExercise = InferSelectModel<typeof studentExercises>;

export interface StudentExerciseWithTenant extends StudentExercise {
  tenantId: string;
}

@Injectable()
export class StudentExercisesRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async create(data: {
    workoutDayId: string;
    exerciseId: string;
    sets: number;
    repetitions?: number;
    plannedWeight?: string;
    restSeconds?: number;
    duration?: string;
    order: number;
    notes?: string;
  }, tx?: DbTransaction): Promise<StudentExercise> {
    const result = await (tx ?? this.drizzle.db)
      .insert(studentExercises)
      .values(data)
      .returning();

    return result[0];
  }

  async findByIdWithTenant(id: string): Promise<StudentExerciseWithTenant | undefined> {
    const result = await this.drizzle.db
      .select({
        id: studentExercises.id,
        workoutDayId: studentExercises.workoutDayId,
        exerciseId: studentExercises.exerciseId,
        sets: studentExercises.sets,
        repetitions: studentExercises.repetitions,
        plannedWeight: studentExercises.plannedWeight,
        restSeconds: studentExercises.restSeconds,
        duration: studentExercises.duration,
        order: studentExercises.order,
        notes: studentExercises.notes,
        createdAt: studentExercises.createdAt,
        updatedAt: studentExercises.updatedAt,
        tenantId: studentPrograms.tenantId,
      })
      .from(studentExercises)
      .innerJoin(workoutDays, eq(studentExercises.workoutDayId, workoutDays.id))
      .innerJoin(studentPrograms, eq(workoutDays.studentProgramId, studentPrograms.id))
      .where(eq(studentExercises.id, id))
      .limit(1);

    return result[0];
  }

  async update(
    id: string,
    data: Partial<{
      sets: number;
      repetitions: number | null;
      plannedWeight: string | null;
      restSeconds: number | null;
      duration: string | null;
      notes: string | null;
      order: number;
    }>,
  ): Promise<StudentExercise | undefined> {

    const result = await this.drizzle.db
      .update(studentExercises)
      .set(data as any)
      .where(eq(studentExercises.id, id))
      .returning();

    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.drizzle.db
      .delete(studentExercises)
      .where(eq(studentExercises.id, id));
  }

  async findMaxOrderByWorkoutDayId(workoutDayId: string): Promise<number> {
    const result = await this.drizzle.db
      .select({ maxOrder: max(studentExercises.order) })
      .from(studentExercises)
      .where(eq(studentExercises.workoutDayId, workoutDayId));

    return result[0]?.maxOrder ?? -1;
  }

  async reorder(workoutDayId: string, items: { id: string; order: number }[]): Promise<void> {
    if (items.length === 0) return;
    await this.drizzle.db.transaction(async (tx) => {
      await Promise.all(
        items.map((item) =>
          tx
            .update(studentExercises)
            .set({ order: item.order })
            .where(
              and(
                eq(studentExercises.id, item.id),
                eq(studentExercises.workoutDayId, workoutDayId),
              ),
            ),
        ),
      );
    });
  }
}
