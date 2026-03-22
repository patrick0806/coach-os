import { Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";

import { DbTransaction, DrizzleProvider } from "@shared/providers/drizzle.service";
import { coachStudentRelations } from "@config/database/schema/coaching";
import { students } from "@config/database/schema/students";
import { users } from "@config/database/schema/users";
import type { InferSelectModel } from "drizzle-orm";

export type CoachStudentRelation = InferSelectModel<typeof coachStudentRelations>;

export type CoachStudentRelationWithStudent = CoachStudentRelation & {
  studentName: string;
  studentEmail: string;
};

@Injectable()
export class CoachStudentRelationsRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async create(data: {
    tenantId: string;
    studentId: string;
    status: "active" | "paused" | "archived";
    startDate: Date;
    endDate?: Date;
  }, tx?: DbTransaction): Promise<CoachStudentRelation> {
    const result = await (tx ?? this.drizzle.db)
      .insert(coachStudentRelations)
      .values(data)
      .returning();

    return result[0];
  }

  async findByTenantId(tenantId: string): Promise<CoachStudentRelationWithStudent[]> {
    const result = await this.drizzle.db
      .select({
        id: coachStudentRelations.id,
        tenantId: coachStudentRelations.tenantId,
        studentId: coachStudentRelations.studentId,
        status: coachStudentRelations.status,
        startDate: coachStudentRelations.startDate,
        endDate: coachStudentRelations.endDate,
        createdAt: coachStudentRelations.createdAt,
        updatedAt: coachStudentRelations.updatedAt,
        studentName: users.name,
        studentEmail: users.email,
      })
      .from(coachStudentRelations)
      .leftJoin(students, eq(coachStudentRelations.studentId, students.id))
      .leftJoin(users, eq(students.userId, users.id))
      .where(eq(coachStudentRelations.tenantId, tenantId));

    return result as CoachStudentRelationWithStudent[];
  }

  async findByStudentIdAndTenantId(
    studentId: string,
    tenantId: string,
  ): Promise<CoachStudentRelation | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(coachStudentRelations)
      .where(
        and(
          eq(coachStudentRelations.studentId, studentId),
          eq(coachStudentRelations.tenantId, tenantId),
        ),
      )
      .limit(1);

    return result[0];
  }

  async findById(id: string, tenantId: string): Promise<CoachStudentRelation | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(coachStudentRelations)
      .where(and(eq(coachStudentRelations.id, id), eq(coachStudentRelations.tenantId, tenantId)))
      .limit(1);

    return result[0];
  }

  async updateStatus(
    id: string,
    tenantId: string,
    status: "active" | "paused" | "archived",
    endDate?: Date | null,
  ): Promise<CoachStudentRelation | undefined> {
    const result = await this.drizzle.db
      .update(coachStudentRelations)
      .set({ status, ...(endDate !== undefined ? { endDate } : {}) })
      .where(and(eq(coachStudentRelations.id, id), eq(coachStudentRelations.tenantId, tenantId)))
      .returning();

    return result[0];
  }
}
