import { Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import {
  workoutPlanStudents,
  WorkoutPlanStudent,
  workoutPlans,
  WorkoutPlan,
} from "@config/database/schema/workout";

type DrizzleDb = NodePgDatabase<typeof schema>;

@Injectable()
export class WorkoutPlanStudentsRepository {
  constructor(private drizzle: DrizzleProvider) {}

  async findAssignment(
    planId: string,
    studentId: string,
    tx?: DrizzleDb,
  ): Promise<WorkoutPlanStudent | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select()
      .from(workoutPlanStudents)
      .where(
        and(
          eq(workoutPlanStudents.workoutPlanId, planId),
          eq(workoutPlanStudents.studentId, studentId),
        ),
      )
      .limit(1);
    return result[0] ?? null;
  }

  async assign(
    planId: string,
    studentId: string,
    tx?: DrizzleDb,
  ): Promise<WorkoutPlanStudent> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .insert(workoutPlanStudents)
      .values({ workoutPlanId: planId, studentId })
      .returning();
    return result[0];
  }

  async revoke(planId: string, studentId: string, tx?: DrizzleDb): Promise<void> {
    const db = tx ?? this.drizzle.db;
    await db
      .delete(workoutPlanStudents)
      .where(
        and(
          eq(workoutPlanStudents.workoutPlanId, planId),
          eq(workoutPlanStudents.studentId, studentId),
        ),
      );
  }

  async findByStudentId(
    studentId: string,
    tenantId: string,
    tx?: DrizzleDb,
  ): Promise<Array<WorkoutPlan & { studentNames: string[] }>> {
    const db = tx ?? this.drizzle.db;
    const plans = await db
      .select({
        id: workoutPlans.id,
        personalId: workoutPlans.personalId,
        name: workoutPlans.name,
        description: workoutPlans.description,
        planKind: workoutPlans.planKind,
        sourceTemplateId: workoutPlans.sourceTemplateId,
        createdAt: workoutPlans.createdAt,
        updatedAt: workoutPlans.updatedAt,
      })
      .from(workoutPlanStudents)
      .innerJoin(workoutPlans, eq(workoutPlans.id, workoutPlanStudents.workoutPlanId))
      .where(
        and(
          eq(workoutPlanStudents.studentId, studentId),
          eq(workoutPlans.personalId, tenantId),
        ),
      )
      .orderBy(workoutPlans.name);

    return plans.map((plan) => ({
      ...plan,
      studentNames: [],
    }));
  }
}
