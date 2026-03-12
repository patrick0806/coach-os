import { Injectable } from "@nestjs/common";
import { and, asc, count, eq, inArray } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import {
  workoutPlans,
  WorkoutPlan,
  workoutExercises,
  exercises,
  workoutPlanStudents,
} from "@config/database/schema/workout";
import { students } from "@config/database/schema/students";
import { users } from "@config/database/schema/users";
import { WorkoutExerciseRow } from "./workout-exercises.repository";

type DrizzleDb = NodePgDatabase<typeof schema>;

export interface CreateWorkoutPlanInput {
  personalId: string;
  name: string;
  description?: string | null;
  planKind: "template" | "student";
  sourceTemplateId: string | null;
}

export interface UpdateWorkoutPlanInput {
  name?: string;
  description?: string | null;
}

export interface WorkoutPlanDetail extends WorkoutPlan {
  studentNames: string[];
  exercises: WorkoutExerciseRow[];
}

export interface PaginatedWorkoutPlans {
  content: Array<WorkoutPlan & { studentNames: string[] }>;
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
    options: { page: number; size: number; kind?: "template" | "student" },
    tx?: DrizzleDb,
  ): Promise<PaginatedWorkoutPlans> {
    const db = tx ?? this.drizzle.db;
    const { page, size, kind } = options;
    const offset = (page - 1) * size;
    const tenantFilter = and(
      eq(workoutPlans.personalId, tenantId),
      kind ? eq(workoutPlans.planKind, kind) : undefined,
    );

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

    const studentNamesByPlanId = await this.loadStudentNamesByPlanIds(
      rows.map((plan) => plan.id),
      db,
    );

    const totalElements = Number(countResult[0].total);

    return {
      content: rows.map((plan) => ({
        ...plan,
        studentNames: studentNamesByPlanId.get(plan.id) ?? [],
      })),
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
          restTime: workoutExercises.restTime,
          executionTime: workoutExercises.executionTime,
          order: workoutExercises.order,
          notes: workoutExercises.notes,
        },
        ex: {
          name: exercises.name,
          muscleGroup: exercises.muscleGroup,
          exercisedbGifUrl: exercises.exercisedbGifUrl,
          youtubeUrl: exercises.youtubeUrl,
        },
      })
      .from(workoutPlans)
      .leftJoin(workoutExercises, eq(workoutExercises.workoutPlanId, workoutPlans.id))
      .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
      .where(and(eq(workoutPlans.id, id), eq(workoutPlans.personalId, tenantId)))
      .orderBy(asc(workoutExercises.order));

    if (rows.length === 0) return null;

    const plan = rows[0].plan;
    const studentNamesByPlanId = await this.loadStudentNamesByPlanIds([plan.id], db);
    const exerciseRows: WorkoutExerciseRow[] = rows
      .filter((r) => r.we !== null && r.we.id !== null)
      .map((r) => ({
        id: r.we.id!,
        exerciseId: r.we.exerciseId!,
        exerciseName: r.ex.name!,
        muscleGroup: r.ex.muscleGroup!,
        exercisedbGifUrl: r.ex.exercisedbGifUrl ?? null,
        youtubeUrl: r.ex.youtubeUrl ?? null,
        sets: r.we.sets!,
        repetitions: r.we.repetitions!,
        load: r.we.load ?? null,
        restTime: r.we.restTime ?? null,
        executionTime: r.we.executionTime ?? null,
        order: r.we.order!,
        notes: r.we.notes ?? null,
      }));

    return {
      ...plan,
      studentNames: studentNamesByPlanId.get(plan.id) ?? [],
      exercises: exerciseRows,
    };
  }

  async create(
    data: CreateWorkoutPlanInput,
    tx?: DrizzleDb,
  ): Promise<WorkoutPlan & { studentNames: string[] }> {
    const db = tx ?? this.drizzle.db;
    // Cast needed: Drizzle v0.39 $inferInsert narrowing
     
    const result = await db.insert(workoutPlans).values(data as any).returning();
    return { ...result[0], studentNames: [] };
  }

  async update(
    id: string,
    tenantId: string,
    data: UpdateWorkoutPlanInput,
    tx?: DrizzleDb,
  ): Promise<(WorkoutPlan & { studentNames: string[] }) | null> {
    const db = tx ?? this.drizzle.db;
     
    const result = await db
      .update(workoutPlans)
       
      .set(data as any)
      .where(and(eq(workoutPlans.id, id), eq(workoutPlans.personalId, tenantId)))
      .returning();
    if (!result[0]) {
      return null;
    }

    const studentNamesByPlanId = await this.loadStudentNamesByPlanIds([result[0].id], db);

    return {
      ...result[0],
      studentNames: studentNamesByPlanId.get(result[0].id) ?? [],
    };
  }

  async delete(id: string, tenantId: string, tx?: DrizzleDb): Promise<void> {
    const db = tx ?? this.drizzle.db;
    await db
      .delete(workoutPlans)
      .where(and(eq(workoutPlans.id, id), eq(workoutPlans.personalId, tenantId)));
  }

  private async loadStudentNamesByPlanIds(
    planIds: string[],
    db: DrizzleDb,
  ): Promise<Map<string, string[]>> {
    const studentNamesByPlanId = new Map<string, string[]>();

    if (planIds.length === 0) {
      return studentNamesByPlanId;
    }

    const rows = await db
      .select({
        workoutPlanId: workoutPlanStudents.workoutPlanId,
        studentName: users.name,
      })
      .from(workoutPlanStudents)
      .innerJoin(students, eq(students.id, workoutPlanStudents.studentId))
      .innerJoin(users, eq(users.id, students.userId))
      .where(inArray(workoutPlanStudents.workoutPlanId, planIds));

    for (const row of rows) {
      const names = studentNamesByPlanId.get(row.workoutPlanId) ?? [];
      names.push(row.studentName);
      studentNamesByPlanId.set(row.workoutPlanId, names);
    }

    return studentNamesByPlanId;
  }
}
