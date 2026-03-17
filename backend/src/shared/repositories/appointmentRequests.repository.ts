import { Injectable } from "@nestjs/common";
import { and, desc, eq, sql } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { appointmentRequests } from "@config/database/schema/scheduling";
import { students } from "@config/database/schema/students";
import { users } from "@config/database/schema/users";

export type AppointmentRequest = InferSelectModel<typeof appointmentRequests>;

export interface AppointmentRequestWithStudent extends AppointmentRequest {
  studentName: string | null;
  studentEmail: string | null;
}

@Injectable()
export class AppointmentRequestsRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async create(data: {
    tenantId: string;
    studentId: string;
    requestedDate: Date;
    requestedStartTime: string;
    requestedEndTime: string;
    status: "pending" | "approved" | "rejected";
    notes?: string;
  }): Promise<AppointmentRequest> {
    const result = await this.drizzle.db
      .insert(appointmentRequests)
      .values(data)
      .returning();

    return result[0];
  }

  async findById(
    id: string,
    tenantId: string,
  ): Promise<AppointmentRequest | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(appointmentRequests)
      .where(
        and(
          eq(appointmentRequests.id, id),
          eq(appointmentRequests.tenantId, tenantId),
        ),
      )
      .limit(1);

    return result[0];
  }

  async findAllByTenantId(
    tenantId: string,
    opts: {
      page: number;
      size: number;
      status?: string;
    },
  ): Promise<{ rows: AppointmentRequestWithStudent[]; total: number }> {
    const { page, size, status } = opts;

    const conditions = and(
      eq(appointmentRequests.tenantId, tenantId),
      status
        ? eq(
            appointmentRequests.status,
            status as "pending" | "approved" | "rejected",
          )
        : undefined,
    );

    const [rows, totalResult] = await Promise.all([
      this.drizzle.db
        .select({
          id: appointmentRequests.id,
          tenantId: appointmentRequests.tenantId,
          studentId: appointmentRequests.studentId,
          requestedDate: appointmentRequests.requestedDate,
          requestedStartTime: appointmentRequests.requestedStartTime,
          requestedEndTime: appointmentRequests.requestedEndTime,
          status: appointmentRequests.status,
          notes: appointmentRequests.notes,
          createdAt: appointmentRequests.createdAt,
          updatedAt: appointmentRequests.updatedAt,
          studentName: users.name,
          studentEmail: users.email,
        })
        .from(appointmentRequests)
        .leftJoin(students, eq(appointmentRequests.studentId, students.id))
        .leftJoin(users, eq(students.userId, users.id))
        .where(conditions)
        .orderBy(desc(appointmentRequests.createdAt))
        .limit(size)
        .offset(page * size),
      this.drizzle.db
        .select({ value: sql<number>`count(*)` })
        .from(appointmentRequests)
        .where(conditions),
    ]);

    return {
      rows,
      total: Number(totalResult[0]?.value ?? 0),
    };
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<{
      status: "pending" | "approved" | "rejected";
    }>,
  ): Promise<AppointmentRequest | undefined> {
    const result = await this.drizzle.db
      .update(appointmentRequests)
      .set(data)
      .where(
        and(
          eq(appointmentRequests.id, id),
          eq(appointmentRequests.tenantId, tenantId),
        ),
      )
      .returning();

    return result[0];
  }
}
