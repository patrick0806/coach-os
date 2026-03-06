import { Injectable } from "@nestjs/common";
import { and, count, eq, ilike, or } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import { students, Student, NewStudent } from "@config/database/schema/students";
import { users } from "@config/database/schema/users";

type DrizzleDb = NodePgDatabase<typeof schema>;

export interface StudentWithUser {
  id: string;
  userId: string;
  personalId: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FindAllOptions {
  page: number;
  size: number;
  search?: string;
}

export interface PaginatedStudents {
  content: StudentWithUser[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

@Injectable()
export class StudentsRepository {
  constructor(private drizzle: DrizzleProvider) {}

  async findByUserId(userId: string, tx?: DrizzleDb): Promise<Student | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select()
      .from(students)
      .where(eq(students.userId, userId))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: NewStudent, tx?: DrizzleDb): Promise<Student> {
    const db = tx ?? this.drizzle.db;
    const result = await db.insert(students).values(data).returning();
    return result[0];
  }

  async findAll(
    tenantId: string,
    options: FindAllOptions,
    tx?: DrizzleDb,
  ): Promise<PaginatedStudents> {
    const db = tx ?? this.drizzle.db;
    const { page, size, search } = options;
    const offset = (page - 1) * size;

    const searchCondition = search
      ? or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`),
        )
      : undefined;

    const baseWhere = and(
      eq(students.personalId, tenantId),
      searchCondition,
    );

    const [rows, countResult] = await Promise.all([
      db
        .select({
          id: students.id,
          userId: students.userId,
          personalId: students.personalId,
          name: users.name,
          email: users.email,
          isActive: users.isActive,
          createdAt: students.createdAt,
          updatedAt: students.updatedAt,
        })
        .from(students)
        .innerJoin(users, eq(students.userId, users.id))
        .where(baseWhere)
        .orderBy(students.createdAt)
        .limit(size)
        .offset(offset),
      db
        .select({ total: count() })
        .from(students)
        .innerJoin(users, eq(students.userId, users.id))
        .where(baseWhere),
    ]);

    const totalElements = Number(countResult[0].total);

    return {
      content: rows,
      page,
      size,
      totalElements,
      totalPages: Math.ceil(totalElements / size),
    };
  }

  async countActiveByPersonal(personalId: string, tx?: DrizzleDb): Promise<number> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select({ total: count() })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(and(eq(students.personalId, personalId), eq(users.isActive, true)));
    return Number(result[0].total);
  }

  async findById(
    id: string,
    tenantId: string,
    tx?: DrizzleDb,
  ): Promise<StudentWithUser | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select({
        id: students.id,
        userId: students.userId,
        personalId: students.personalId,
        name: users.name,
        email: users.email,
        isActive: users.isActive,
        createdAt: students.createdAt,
        updatedAt: students.updatedAt,
      })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(and(eq(students.id, id), eq(students.personalId, tenantId)))
      .limit(1);
    return result[0] ?? null;
  }
}
