import { Injectable } from "@nestjs/common";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import {
  studentPrograms,
  workoutDays,
  studentExercises,
} from "@config/database/schema/training";
import { exercises } from "@config/database/schema/exercises";

export type StudentProgram = InferSelectModel<typeof studentPrograms>;
export type WorkoutDay = InferSelectModel<typeof workoutDays>;
export type StudentExercise = InferSelectModel<typeof studentExercises>;

export interface StudentExerciseWithExercise extends StudentExercise {
  exercise: {
    id: string;
    name: string;
    muscleGroup: string;
    mediaUrl: string | null;
  };
}

export interface WorkoutDayWithExercises extends WorkoutDay {
  studentExercises: StudentExerciseWithExercise[];
}

export interface StudentProgramWithTree extends StudentProgram {
  workoutDays: WorkoutDayWithExercises[];
}

@Injectable()
export class StudentProgramsRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async create(data: {
    tenantId: string;
    studentId: string;
    programTemplateId?: string;
    name: string;
  }): Promise<StudentProgram> {
    // Drizzle ORM type inference limitation: optional/nullable columns not fully inferred in insert type
     
    const result = await this.drizzle.db
      .insert(studentPrograms)
      .values({
        tenantId: data.tenantId,
        studentId: data.studentId,
        programTemplateId: data.programTemplateId ?? null,
        name: data.name,
        status: "active",
      } as any)
      .returning();

    return result[0];
  }

  async findAllByStudentAndTenant(
    studentId: string,
    tenantId: string,
    opts: {
      page: number;
      size: number;
      status?: string;
    },
  ): Promise<{ rows: StudentProgram[]; total: number }> {
    const { page, size, status } = opts;

    const conditions = and(
      eq(studentPrograms.studentId, studentId),
      eq(studentPrograms.tenantId, tenantId),
      status
        ? eq(studentPrograms.status, status as "active" | "finished" | "cancelled")
        : undefined,
    );

    const [rows, totalResult] = await Promise.all([
      this.drizzle.db
        .select()
        .from(studentPrograms)
        .where(conditions)
        .orderBy(asc(studentPrograms.createdAt))
        .limit(size)
        .offset(page * size),
      this.drizzle.db
        .select({ value: sql<number>`count(*)` })
        .from(studentPrograms)
        .where(conditions),
    ]);

    return {
      rows,
      total: Number(totalResult[0]?.value ?? 0),
    };
  }

  async findById(id: string, tenantId: string): Promise<StudentProgram | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(studentPrograms)
      .where(and(eq(studentPrograms.id, id), eq(studentPrograms.tenantId, tenantId)))
      .limit(1);

    return result[0];
  }

  async findByIdWithTree(
    id: string,
    tenantId: string,
  ): Promise<StudentProgramWithTree | undefined> {
    // Step 1: fetch the student program
    const programResult = await this.drizzle.db
      .select()
      .from(studentPrograms)
      .where(and(eq(studentPrograms.id, id), eq(studentPrograms.tenantId, tenantId)))
      .limit(1);

    const program = programResult[0];
    if (!program) return undefined;

    // Step 2: fetch workout days ordered by order
    const days = await this.drizzle.db
      .select()
      .from(workoutDays)
      .where(eq(workoutDays.studentProgramId, id))
      .orderBy(asc(workoutDays.order));

    if (days.length === 0) {
      return { ...program, workoutDays: [] };
    }

    // Step 3: fetch student exercises with exercise data for all workout days
    const dayIds = days.map((d) => d.id);

    const exerciseRows = await this.drizzle.db
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
        exerciseName: exercises.name,
        exerciseMuscleGroup: exercises.muscleGroup,
        exerciseMediaUrl: exercises.mediaUrl,
      })
      .from(studentExercises)
      .innerJoin(exercises, eq(studentExercises.exerciseId, exercises.id))
      .where(inArray(studentExercises.workoutDayId, dayIds))
      .orderBy(asc(studentExercises.order));

    // Step 4: compose tree in code
    const exercisesByDay = new Map<string, StudentExerciseWithExercise[]>();
    for (const row of exerciseRows) {
      const item: StudentExerciseWithExercise = {
        id: row.id,
        workoutDayId: row.workoutDayId,
        exerciseId: row.exerciseId,
        sets: row.sets,
        repetitions: row.repetitions,
        plannedWeight: row.plannedWeight,
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

      const existing = exercisesByDay.get(row.workoutDayId) ?? [];
      existing.push(item);
      exercisesByDay.set(row.workoutDayId, existing);
    }

    const daysWithExercises: WorkoutDayWithExercises[] = days.map((d) => ({
      ...d,
      studentExercises: exercisesByDay.get(d.id) ?? [],
    }));

    return { ...program, workoutDays: daysWithExercises };
  }

  async updateStatus(
    id: string,
    tenantId: string,
    status: "active" | "finished" | "cancelled",
  ): Promise<StudentProgram | undefined> {
     
    const result = await this.drizzle.db
      .update(studentPrograms)
      .set({ status } as any)
      .where(and(eq(studentPrograms.id, id), eq(studentPrograms.tenantId, tenantId)))
      .returning();

    return result[0];
  }
}
