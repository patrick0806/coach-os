import { Injectable } from "@nestjs/common";
import { and, desc, eq, gte, lte, ne, or, sql } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { DbTransaction, DrizzleProvider } from "@shared/providers/drizzle.service";
import { appointments } from "@config/database/schema/scheduling";
import { students } from "@config/database/schema/students";
import { users } from "@config/database/schema/users";

export type Appointment = InferSelectModel<typeof appointments>;

export interface AppointmentWithStudent extends Appointment {
  studentName: string | null;
  studentEmail: string | null;
}

@Injectable()
export class AppointmentsRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async create(data: {
    tenantId: string;
    studentId: string;
    appointmentRequestId?: string;
    startAt: Date;
    endAt: Date;
    appointmentType: "online" | "presential";
    status: "scheduled" | "completed" | "cancelled" | "no_show";
    meetingUrl?: string;
    location?: string;
    notes?: string;
  }, tx?: DbTransaction): Promise<Appointment> {
    const result = await (tx ?? this.drizzle.db)
      .insert(appointments)
      .values(data)
      .returning();

    return result[0];
  }

  async findById(
    id: string,
    tenantId: string,
  ): Promise<Appointment | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(appointments)
      .where(
        and(eq(appointments.id, id), eq(appointments.tenantId, tenantId)),
      )
      .limit(1);

    return result[0];
  }

  async findAllByTenantId(
    tenantId: string,
    opts: {
      page: number;
      size: number;
      startDate?: Date;
      endDate?: Date;
      status?: string;
      studentId?: string;
    },
  ): Promise<{ rows: AppointmentWithStudent[]; total: number }> {
    const { page, size, startDate, endDate, status, studentId } = opts;

    const conditions = and(
      eq(appointments.tenantId, tenantId),
      startDate ? gte(appointments.startAt, startDate) : undefined,
      endDate ? lte(appointments.startAt, endDate) : undefined,
      status
        ? eq(
            appointments.status,
            status as "scheduled" | "completed" | "cancelled" | "no_show",
          )
        : undefined,
      studentId ? eq(appointments.studentId, studentId) : undefined,
    );

    const [rows, totalResult] = await Promise.all([
      this.drizzle.db
        .select({
          id: appointments.id,
          tenantId: appointments.tenantId,
          studentId: appointments.studentId,
          appointmentRequestId: appointments.appointmentRequestId,
          startAt: appointments.startAt,
          endAt: appointments.endAt,
          appointmentType: appointments.appointmentType,
          status: appointments.status,
          meetingUrl: appointments.meetingUrl,
          location: appointments.location,
          notes: appointments.notes,
          cancelledAt: appointments.cancelledAt,
          cancellationReason: appointments.cancellationReason,
          createdAt: appointments.createdAt,
          updatedAt: appointments.updatedAt,
          studentName: users.name,
          studentEmail: users.email,
        })
        .from(appointments)
        .leftJoin(students, eq(appointments.studentId, students.id))
        .leftJoin(users, eq(students.userId, users.id))
        .where(conditions)
        .orderBy(desc(appointments.startAt))
        .limit(size)
        .offset(page * size),
      this.drizzle.db
        .select({ value: sql<number>`count(*)` })
        .from(appointments)
        .where(conditions),
    ]);

    return {
      rows,
      total: Number(totalResult[0]?.value ?? 0),
    };
  }

  async findAllInDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AppointmentWithStudent[]> {
    const conditions = and(
      eq(appointments.tenantId, tenantId),
      gte(appointments.startAt, startDate),
      lte(appointments.startAt, endDate),
    );

    return this.drizzle.db
      .select({
        id: appointments.id,
        tenantId: appointments.tenantId,
        studentId: appointments.studentId,
        appointmentRequestId: appointments.appointmentRequestId,
        startAt: appointments.startAt,
        endAt: appointments.endAt,
        appointmentType: appointments.appointmentType,
        status: appointments.status,
        meetingUrl: appointments.meetingUrl,
        location: appointments.location,
        notes: appointments.notes,
        cancelledAt: appointments.cancelledAt,
        cancellationReason: appointments.cancellationReason,
        createdAt: appointments.createdAt,
        updatedAt: appointments.updatedAt,
        studentName: users.name,
        studentEmail: users.email,
      })
      .from(appointments)
      .leftJoin(students, eq(appointments.studentId, students.id))
      .leftJoin(users, eq(students.userId, users.id))
      .where(conditions)
      .orderBy(desc(appointments.startAt)) as Promise<AppointmentWithStudent[]>;
  }

  async findOverlapping(
    tenantId: string,
    startAt: Date,
    endAt: Date,
    excludeId?: string,
  ): Promise<Appointment[]> {
    const conditions = and(
      eq(appointments.tenantId, tenantId),
      eq(appointments.status, "scheduled"),
      excludeId ? ne(appointments.id, excludeId) : undefined,
      or(
        and(lte(appointments.startAt, startAt), gte(appointments.endAt, startAt)),
        and(lte(appointments.startAt, endAt), gte(appointments.endAt, endAt)),
        and(gte(appointments.startAt, startAt), lte(appointments.endAt, endAt)),
      ),
    );

    return this.drizzle.db
      .select()
      .from(appointments)
      .where(conditions);
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<{
      status: "scheduled" | "completed" | "cancelled" | "no_show";
      cancelledAt: Date;
      cancellationReason: string;
      notes: string;
      startAt: Date;
      endAt: Date;
      appointmentType: "online" | "presential";
      meetingUrl: string | null;
      location: string | null;
    }>,
  ): Promise<Appointment | undefined> {
     
    const result = await this.drizzle.db
      .update(appointments)
      .set(data as any)
      .where(
        and(eq(appointments.id, id), eq(appointments.tenantId, tenantId)),
      )
      .returning();

    return result[0];
  }
}
