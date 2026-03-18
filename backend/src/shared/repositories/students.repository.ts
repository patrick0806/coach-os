import { Injectable } from "@nestjs/common";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { students } from "@config/database/schema/students";
import { users } from "@config/database/schema/users";
import type { InferSelectModel } from "drizzle-orm";

export type Student = InferSelectModel<typeof students>;

export type StudentWithUser = Student & {
  name: string;
  email: string;
};

@Injectable()
export class StudentsRepository {
  constructor(private readonly drizzle: DrizzleProvider) { }

  async create(data: {
    userId: string;
    tenantId: string;
    status?: "active" | "paused" | "archived";
    phoneNumber?: string;
    goal?: string;
    observations?: string;
    physicalRestrictions?: string;
  }): Promise<Student> {
    const result = await this.drizzle.db
      .insert(students)
      .values(data)
      .returning();

    return result[0];
  }

  async findById(id: string, tenantId: string): Promise<StudentWithUser | undefined> {
    const result = await this.drizzle.db
      .select({
        id: students.id,
        userId: students.userId,
        tenantId: students.tenantId,
        status: students.status,
        phoneNumber: students.phoneNumber,
        goal: students.goal,
        observations: students.observations,
        physicalRestrictions: students.physicalRestrictions,
        currentStreak: students.currentStreak,
        lastWorkoutDate: students.lastWorkoutDate,
        totalWorkouts: students.totalWorkouts,
        createdAt: students.createdAt,
        updatedAt: students.updatedAt,
        name: users.name,
        email: users.email,
      })
      .from(students)
      .leftJoin(users, eq(students.userId, users.id))
      .where(and(eq(students.id, id), eq(students.tenantId, tenantId)))
      .limit(1);

    return result[0] as StudentWithUser | undefined;
  }

  async findByUserId(userId: string): Promise<Student | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(students)
      .where(eq(students.userId, userId))
      .limit(1);

    return result[0];
  }

  async findByUserIdAndTenantId(userId: string, tenantId: string): Promise<Student | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(students)
      .where(and(eq(students.userId, userId), eq(students.tenantId, tenantId)))
      .limit(1);

    return result[0];
  }

  async findAllByTenantId(
    tenantId: string,
    opts: {
      page: number;
      size: number;
      search?: string;
      status?: "active" | "paused" | "archived";
    },
  ): Promise<{ rows: StudentWithUser[]; total: number }> {
    const { page, size, search, status } = opts;

    const conditions = and(
      eq(students.tenantId, tenantId),
      search
        ? or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`))
        : undefined,
      status ? eq(students.status, status) : undefined,
    );

    const [rows, totalResult] = await Promise.all([
      this.drizzle.db
        .select({
          id: students.id,
          userId: students.userId,
          tenantId: students.tenantId,
          status: students.status,
          phoneNumber: students.phoneNumber,
          goal: students.goal,
          observations: students.observations,
          physicalRestrictions: students.physicalRestrictions,
          currentStreak: students.currentStreak,
          lastWorkoutDate: students.lastWorkoutDate,
          totalWorkouts: students.totalWorkouts,
          createdAt: students.createdAt,
          updatedAt: students.updatedAt,
          name: users.name,
          email: users.email,
        })
        .from(students)
        .leftJoin(users, eq(students.userId, users.id))
        .where(conditions)
        .orderBy(desc(users.name))
        .limit(size)
        .offset(page * size),
      this.drizzle.db
        .select({ value: sql<number>`count(*)` })
        .from(students)
        .leftJoin(users, eq(students.userId, users.id))
        .where(conditions),
    ]);

    return {
      rows: rows as StudentWithUser[],
      total: Number(totalResult[0]?.value ?? 0),
    };
  }

  async countByTenantId(tenantId: string): Promise<number> {
    const result = await this.drizzle.db
      .select({ value: sql<number>`count(*)` })
      .from(students)
      .where(eq(students.tenantId, tenantId));

    return Number(result[0]?.value ?? 0);
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<{
      phoneNumber: string | null;
      goal: string | null;
      observations: string | null;
      physicalRestrictions: string | null;
    }>,
  ): Promise<Student | undefined> {
    // Drizzle ORM type inference limitation: nullable columns not inferred in SET type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await this.drizzle.db
      .update(students)
      .set(data as any)
      .where(and(eq(students.id, id), eq(students.tenantId, tenantId)))
      .returning();

    return result[0];
  }

  async updateStatus(
    id: string,
    tenantId: string,
    status: "active" | "paused" | "archived",
  ): Promise<Student | undefined> {
    // Drizzle ORM type inference limitation: status is not inferred in the SET type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await this.drizzle.db
      .update(students)
      .set({ status } as any)
      .where(and(eq(students.id, id), eq(students.tenantId, tenantId)))
      .returning();

    return result[0];
  }
}
