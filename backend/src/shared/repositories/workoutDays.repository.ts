import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { DbTransaction, DrizzleProvider } from "@shared/providers/drizzle.service";
import { workoutDays, studentPrograms } from "@config/database/schema/training";

export type WorkoutDay = InferSelectModel<typeof workoutDays>;

export interface WorkoutDayWithTenant extends WorkoutDay {
  tenantId: string;
}

@Injectable()
export class WorkoutDaysRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async create(data: {
    studentProgramId: string;
    name: string;
    description?: string;
    order: number;
  }, tx?: DbTransaction): Promise<WorkoutDay> {
    const result = await (tx ?? this.drizzle.db)
      .insert(workoutDays)
      .values(data)
      .returning();

    return result[0];
  }

  async findByIdWithTenant(id: string): Promise<WorkoutDayWithTenant | undefined> {
    const result = await this.drizzle.db
      .select({
        id: workoutDays.id,
        studentProgramId: workoutDays.studentProgramId,
        name: workoutDays.name,
        description: workoutDays.description,
        order: workoutDays.order,
        createdAt: workoutDays.createdAt,
        updatedAt: workoutDays.updatedAt,
        tenantId: studentPrograms.tenantId,
      })
      .from(workoutDays)
      .innerJoin(
        studentPrograms,
        eq(workoutDays.studentProgramId, studentPrograms.id),
      )
      .where(eq(workoutDays.id, id))
      .limit(1);

    return result[0];
  }

  async update(
    id: string,
    data: Partial<{ name: string; description: string | null; order: number }>,
  ): Promise<WorkoutDay | undefined> {
     
    const result = await this.drizzle.db
      .update(workoutDays)
      .set(data as any)
      .where(eq(workoutDays.id, id))
      .returning();

    return result[0];
  }
}
