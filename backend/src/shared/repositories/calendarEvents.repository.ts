import { Injectable } from "@nestjs/common";
import { and, desc, eq, gte, lte, ne, or, sql } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { calendarEvents } from "@config/database/schema/scheduling";
import { students } from "@config/database/schema/students";
import { users } from "@config/database/schema/users";

export type CalendarEvent = InferSelectModel<typeof calendarEvents>;

export interface CalendarEventWithStudent extends CalendarEvent {
  studentName: string | null;
  studentEmail: string | null;
}

@Injectable()
export class CalendarEventsRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async create(data: {
    tenantId: string;
    studentId?: string;
    startAt: Date;
    endAt: Date;
    type: "one_off" | "override" | "block";
    recurringSlotId?: string;
    originalStartAt?: Date;
    status: "scheduled" | "cancelled" | "completed" | "no_show";
    appointmentType?: "online" | "presential";
    meetingUrl?: string;
    location?: string;
    notes?: string;
  }): Promise<CalendarEvent> {
    const result = await this.drizzle.db
      .insert(calendarEvents)
      .values(data)
      .returning();

    return result[0];
  }

  async findById(
    id: string,
    tenantId: string,
  ): Promise<CalendarEvent | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.id, id),
          eq(calendarEvents.tenantId, tenantId),
        ),
      )
      .limit(1);

    return result[0];
  }

  async findByDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CalendarEventWithStudent[]> {
    return this.drizzle.db
      .select({
        id: calendarEvents.id,
        tenantId: calendarEvents.tenantId,
        studentId: calendarEvents.studentId,
        startAt: calendarEvents.startAt,
        endAt: calendarEvents.endAt,
        type: calendarEvents.type,
        recurringSlotId: calendarEvents.recurringSlotId,
        originalStartAt: calendarEvents.originalStartAt,
        status: calendarEvents.status,
        appointmentType: calendarEvents.appointmentType,
        meetingUrl: calendarEvents.meetingUrl,
        location: calendarEvents.location,
        notes: calendarEvents.notes,
        cancelledAt: calendarEvents.cancelledAt,
        cancellationReason: calendarEvents.cancellationReason,
        createdAt: calendarEvents.createdAt,
        updatedAt: calendarEvents.updatedAt,
        studentName: users.name,
        studentEmail: users.email,
      })
      .from(calendarEvents)
      .leftJoin(students, eq(calendarEvents.studentId, students.id))
      .leftJoin(users, eq(students.userId, users.id))
      .where(
        and(
          eq(calendarEvents.tenantId, tenantId),
          gte(calendarEvents.startAt, startDate),
          lte(calendarEvents.startAt, endDate),
        ),
      )
      .orderBy(calendarEvents.startAt) as Promise<CalendarEventWithStudent[]>;
  }

  async findByRecurringSlotId(
    recurringSlotId: string,
    tenantId: string,
  ): Promise<CalendarEvent[]> {
    return this.drizzle.db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.recurringSlotId, recurringSlotId),
          eq(calendarEvents.tenantId, tenantId),
        ),
      )
      .orderBy(calendarEvents.startAt);
  }

  async findByStudentAndDateRange(
    studentId: string,
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CalendarEventWithStudent[]> {
    return this.drizzle.db
      .select({
        id: calendarEvents.id,
        tenantId: calendarEvents.tenantId,
        studentId: calendarEvents.studentId,
        startAt: calendarEvents.startAt,
        endAt: calendarEvents.endAt,
        type: calendarEvents.type,
        recurringSlotId: calendarEvents.recurringSlotId,
        originalStartAt: calendarEvents.originalStartAt,
        status: calendarEvents.status,
        appointmentType: calendarEvents.appointmentType,
        meetingUrl: calendarEvents.meetingUrl,
        location: calendarEvents.location,
        notes: calendarEvents.notes,
        cancelledAt: calendarEvents.cancelledAt,
        cancellationReason: calendarEvents.cancellationReason,
        createdAt: calendarEvents.createdAt,
        updatedAt: calendarEvents.updatedAt,
        studentName: users.name,
        studentEmail: users.email,
      })
      .from(calendarEvents)
      .leftJoin(students, eq(calendarEvents.studentId, students.id))
      .leftJoin(users, eq(students.userId, users.id))
      .where(
        and(
          eq(calendarEvents.tenantId, tenantId),
          eq(calendarEvents.studentId, studentId),
          gte(calendarEvents.startAt, startDate),
          lte(calendarEvents.startAt, endDate),
        ),
      )
      .orderBy(calendarEvents.startAt) as Promise<CalendarEventWithStudent[]>;
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
      type?: string;
    },
  ): Promise<{ rows: CalendarEventWithStudent[]; total: number }> {
    const { page, size, startDate, endDate, status, studentId, type } = opts;

    const conditions = and(
      eq(calendarEvents.tenantId, tenantId),
      startDate ? gte(calendarEvents.startAt, startDate) : undefined,
      endDate ? lte(calendarEvents.startAt, endDate) : undefined,
      status
        ? eq(
            calendarEvents.status,
            status as "scheduled" | "cancelled" | "completed" | "no_show",
          )
        : undefined,
      studentId ? eq(calendarEvents.studentId, studentId) : undefined,
      type
        ? eq(
            calendarEvents.type,
            type as "one_off" | "override" | "block",
          )
        : undefined,
    );

    const [rows, totalResult] = await Promise.all([
      this.drizzle.db
        .select({
          id: calendarEvents.id,
          tenantId: calendarEvents.tenantId,
          studentId: calendarEvents.studentId,
          startAt: calendarEvents.startAt,
          endAt: calendarEvents.endAt,
          type: calendarEvents.type,
          recurringSlotId: calendarEvents.recurringSlotId,
          originalStartAt: calendarEvents.originalStartAt,
          status: calendarEvents.status,
          appointmentType: calendarEvents.appointmentType,
          meetingUrl: calendarEvents.meetingUrl,
          location: calendarEvents.location,
          notes: calendarEvents.notes,
          cancelledAt: calendarEvents.cancelledAt,
          cancellationReason: calendarEvents.cancellationReason,
          createdAt: calendarEvents.createdAt,
          updatedAt: calendarEvents.updatedAt,
          studentName: users.name,
          studentEmail: users.email,
        })
        .from(calendarEvents)
        .leftJoin(students, eq(calendarEvents.studentId, students.id))
        .leftJoin(users, eq(students.userId, users.id))
        .where(conditions)
        .orderBy(desc(calendarEvents.startAt))
        .limit(size)
        .offset(page * size),
      this.drizzle.db
        .select({ value: sql<number>`count(*)` })
        .from(calendarEvents)
        .where(conditions),
    ]);

    return {
      rows: rows as CalendarEventWithStudent[],
      total: Number(totalResult[0]?.value ?? 0),
    };
  }

  async findOverlapping(
    tenantId: string,
    startAt: Date,
    endAt: Date,
    excludeId?: string,
  ): Promise<CalendarEvent[]> {
    const conditions = and(
      eq(calendarEvents.tenantId, tenantId),
      ne(calendarEvents.status, "cancelled"),
      excludeId ? ne(calendarEvents.id, excludeId) : undefined,
      or(
        and(
          lte(calendarEvents.startAt, startAt),
          gte(calendarEvents.endAt, startAt),
        ),
        and(
          lte(calendarEvents.startAt, endAt),
          gte(calendarEvents.endAt, endAt),
        ),
        and(
          gte(calendarEvents.startAt, startAt),
          lte(calendarEvents.endAt, endAt),
        ),
      ),
    );

    return this.drizzle.db
      .select()
      .from(calendarEvents)
      .where(conditions);
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<{
      status: "scheduled" | "cancelled" | "completed" | "no_show";
      startAt: Date;
      endAt: Date;
      appointmentType: "online" | "presential";
      meetingUrl: string | null;
      location: string | null;
      notes: string | null;
      cancelledAt: Date;
      cancellationReason: string;
    }>,
  ): Promise<CalendarEvent | undefined> {
    const result = await this.drizzle.db
      .update(calendarEvents)
      .set(data as any)
      .where(
        and(
          eq(calendarEvents.id, id),
          eq(calendarEvents.tenantId, tenantId),
        ),
      )
      .returning();

    return result[0];
  }
}
