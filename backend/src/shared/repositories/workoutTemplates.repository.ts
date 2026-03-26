import { Injectable } from "@nestjs/common";
import { and, eq, max } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { DbTransaction, DrizzleProvider } from "@shared/providers/drizzle.service";
import { workoutTemplates, programTemplates } from "@config/database/schema/training";

export type WorkoutTemplate = InferSelectModel<typeof workoutTemplates>;

export interface WorkoutTemplateWithTenant extends WorkoutTemplate {
  tenantId: string;
}

@Injectable()
export class WorkoutTemplatesRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async create(data: {
    programTemplateId: string;
    name: string;
    order: number;
  }, tx?: DbTransaction): Promise<WorkoutTemplate> {
    const result = await (tx ?? this.drizzle.db)
      .insert(workoutTemplates)
      .values(data)
      .returning();

    return result[0];
  }

  async findById(id: string): Promise<WorkoutTemplate | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(workoutTemplates)
      .where(eq(workoutTemplates.id, id))
      .limit(1);

    return result[0];
  }

  async findByIdWithTenant(id: string): Promise<WorkoutTemplateWithTenant | undefined> {
    const result = await this.drizzle.db
      .select({
        id: workoutTemplates.id,
        programTemplateId: workoutTemplates.programTemplateId,
        name: workoutTemplates.name,
        order: workoutTemplates.order,
        createdAt: workoutTemplates.createdAt,
        updatedAt: workoutTemplates.updatedAt,
        tenantId: programTemplates.tenantId,
      })
      .from(workoutTemplates)
      .innerJoin(
        programTemplates,
        eq(workoutTemplates.programTemplateId, programTemplates.id),
      )
      .where(eq(workoutTemplates.id, id))
      .limit(1);

    return result[0];
  }

  async findMaxOrderByProgramTemplateId(programTemplateId: string): Promise<number> {
    const result = await this.drizzle.db
      .select({ maxOrder: max(workoutTemplates.order) })
      .from(workoutTemplates)
      .where(eq(workoutTemplates.programTemplateId, programTemplateId));

    return result[0]?.maxOrder ?? -1;
  }

  async update(
    id: string,
    data: Partial<{ name: string; order: number }>,
  ): Promise<WorkoutTemplate | undefined> {
    const result = await this.drizzle.db
      .update(workoutTemplates)
      .set(data)
      .where(eq(workoutTemplates.id, id))
      .returning();

    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.drizzle.db
      .delete(workoutTemplates)
      .where(eq(workoutTemplates.id, id));
  }

  async reorder(programTemplateId: string, items: { id: string; order: number }[]): Promise<void> {
    if (items.length === 0) return;
    await this.drizzle.db.transaction(async (tx) => {
      await Promise.all(
        items.map((item) =>
          tx
            .update(workoutTemplates)
            .set({ order: item.order })
            .where(
              and(
                eq(workoutTemplates.id, item.id),
                eq(workoutTemplates.programTemplateId, programTemplateId),
              ),
            ),
        ),
      );
    });
  }
}
