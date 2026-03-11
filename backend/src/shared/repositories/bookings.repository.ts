import { Injectable } from "@nestjs/common";
import { and, count, desc, eq, gte, inArray, lte, notInArray } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import {
  bookings,
  Booking,
  availabilitySlots,
  servicePlans,
} from "@config/database/schema/availability";
import { students } from "@config/database/schema/students";
import { users } from "@config/database/schema/users";

type DrizzleDb = NodePgDatabase<typeof schema>;

export interface CreateBookingInput {
  personalId: string;
  studentId: string;
  servicePlanId: string;
  seriesId?: string | null;
  scheduledDate: Date;
  startTime: string;
  endTime: string;
  notes?: string | null;
}

export interface AvailableSlot {
  id: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
}

export interface PaginatedBookings {
  content: BookingWithRelations[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface BookingWithRelations extends Booking {
  studentName: string;
  studentEmail: string;
  servicePlanName: string;
}

@Injectable()
export class BookingsRepository {
  constructor(private drizzle: DrizzleProvider) {}

  private bookingSelect() {
    return {
      id: bookings.id,
      personalId: bookings.personalId,
      studentId: bookings.studentId,
      servicePlanId: bookings.servicePlanId,
      seriesId: bookings.seriesId,
      scheduledDate: bookings.scheduledDate,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      notes: bookings.notes,
      status: bookings.status,
      cancelledAt: bookings.cancelledAt,
      cancellationReason: bookings.cancellationReason,
      createdAt: bookings.createdAt,
      updatedAt: bookings.updatedAt,
      studentName: users.name,
      studentEmail: users.email,
      servicePlanName: servicePlans.name,
    };
  }

  async findAvailableSlots(
    personalId: string,
    date: string,
    dayOfWeek: number,
    tx?: DrizzleDb,
  ): Promise<AvailableSlot[]> {
    const db = tx ?? this.drizzle.db;

    // Get all active availability slots for the given day
    const slots = await db
      .select({
        id: availabilitySlots.id,
        startTime: availabilitySlots.startTime,
        endTime: availabilitySlots.endTime,
        dayOfWeek: availabilitySlots.dayOfWeek,
      })
      .from(availabilitySlots)
      .where(
        and(
          eq(availabilitySlots.personalId, personalId),
          eq(availabilitySlots.dayOfWeek, dayOfWeek),
          eq(availabilitySlots.isActive, true),
        ),
      );

    if (slots.length === 0) return [];

    // Get booked start times for that date
    const scheduledDate = new Date(date + "T00:00:00Z");
    const bookedTimes = await db
      .select({ startTime: bookings.startTime })
      .from(bookings)
      .where(
        and(
          eq(bookings.personalId, personalId),
          eq(bookings.scheduledDate, scheduledDate),
          eq(bookings.status, "scheduled"),
        ),
      );

    const bookedStartTimes = new Set(bookedTimes.map((b) => b.startTime));

    return slots.filter((slot) => !bookedStartTimes.has(slot.startTime));
  }

  async findConflict(
    personalId: string,
    date: string,
    startTime: string,
    tx?: DrizzleDb,
  ): Promise<Booking | null> {
    const db = tx ?? this.drizzle.db;
    const scheduledDate = new Date(date + "T00:00:00Z");
    const result = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.personalId, personalId),
          eq(bookings.scheduledDate, scheduledDate),
          eq(bookings.startTime, startTime),
          eq(bookings.status, "scheduled"),
        ),
      )
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: CreateBookingInput, tx?: DrizzleDb): Promise<BookingWithRelations> {
    const db = tx ?? this.drizzle.db;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await db.insert(bookings).values(data as any).returning();
    return this.findByIdOrThrow(result[0].id, data.personalId, db);
  }

  async createMany(data: CreateBookingInput[], tx?: DrizzleDb): Promise<BookingWithRelations[]> {
    if (data.length === 0) {
      return [];
    }

    const db = tx ?? this.drizzle.db;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await db.insert(bookings).values(data as any).returning();

    return this.findManyByIds(
      result.map((booking) => booking.id),
      data[0].personalId,
      db,
    );
  }

  async findByStudent(
    studentId: string,
    personalId: string,
    options: { page: number; size: number },
    tx?: DrizzleDb,
  ): Promise<PaginatedBookings> {
    const db = tx ?? this.drizzle.db;
    const { page, size } = options;
    const offset = (page - 1) * size;

    const [rows, [{ total }]] = await Promise.all([
      db
        .select(this.bookingSelect())
        .from(bookings)
        .innerJoin(students, eq(students.id, bookings.studentId))
        .innerJoin(users, eq(users.id, students.userId))
        .innerJoin(servicePlans, eq(servicePlans.id, bookings.servicePlanId))
        .where(
          and(eq(bookings.studentId, studentId), eq(bookings.personalId, personalId)),
        )
        .orderBy(desc(bookings.scheduledDate), desc(bookings.startTime))
        .limit(size)
        .offset(offset),
      db
        .select({ total: count() })
        .from(bookings)
        .where(
          and(eq(bookings.studentId, studentId), eq(bookings.personalId, personalId)),
        ),
    ]);

    return {
      content: rows,
      page,
      size,
      totalElements: Number(total),
      totalPages: Math.ceil(Number(total) / size),
    };
  }

  async findById(id: string, personalId: string, tx?: DrizzleDb): Promise<BookingWithRelations | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select(this.bookingSelect())
      .from(bookings)
      .innerJoin(students, eq(students.id, bookings.studentId))
      .innerJoin(users, eq(users.id, students.userId))
      .innerJoin(servicePlans, eq(servicePlans.id, bookings.servicePlanId))
      .where(and(eq(bookings.id, id), eq(bookings.personalId, personalId)))
      .limit(1);
    return result[0] ?? null;
  }

  private async findByIdOrThrow(
    id: string,
    personalId: string,
    db: DrizzleDb,
  ): Promise<BookingWithRelations> {
    const booking = await this.findById(id, personalId, db);
    if (!booking) {
      throw new Error("Booking not found after creation");
    }
    return booking;
  }

  private async findManyByIds(
    ids: string[],
    personalId: string,
    db: DrizzleDb,
  ): Promise<BookingWithRelations[]> {
    if (ids.length === 0) {
      return [];
    }

    return db
      .select(this.bookingSelect())
      .from(bookings)
      .innerJoin(students, eq(students.id, bookings.studentId))
      .innerJoin(users, eq(users.id, students.userId))
      .innerJoin(servicePlans, eq(servicePlans.id, bookings.servicePlanId))
      .where(and(eq(bookings.personalId, personalId), inArray(bookings.id, ids)))
      .orderBy(bookings.scheduledDate, bookings.startTime);
  }

  async findBySeries(
    seriesId: string,
    personalId: string,
    tx?: DrizzleDb,
  ): Promise<BookingWithRelations[]> {
    const db = tx ?? this.drizzle.db;
    return db
      .select(this.bookingSelect())
      .from(bookings)
      .innerJoin(students, eq(students.id, bookings.studentId))
      .innerJoin(users, eq(users.id, students.userId))
      .innerJoin(servicePlans, eq(servicePlans.id, bookings.servicePlanId))
      .where(and(eq(bookings.seriesId, seriesId), eq(bookings.personalId, personalId)))
      .orderBy(bookings.scheduledDate, bookings.startTime);
  }

  async findFutureBySeries(
    seriesId: string,
    personalId: string,
    fromDate: Date,
    tx?: DrizzleDb,
  ): Promise<BookingWithRelations[]> {
    const db = tx ?? this.drizzle.db;
    return db
      .select(this.bookingSelect())
      .from(bookings)
      .innerJoin(students, eq(students.id, bookings.studentId))
      .innerJoin(users, eq(users.id, students.userId))
      .innerJoin(servicePlans, eq(servicePlans.id, bookings.servicePlanId))
      .where(
        and(
          eq(bookings.seriesId, seriesId),
          eq(bookings.personalId, personalId),
          gte(bookings.scheduledDate, fromDate),
        ),
      )
      .orderBy(bookings.scheduledDate, bookings.startTime);
  }

  async findByPersonal(
    personalId: string,
    options: { page: number; size: number; status?: string; from?: Date; to?: Date },
    tx?: DrizzleDb,
  ): Promise<PaginatedBookings> {
    const db = tx ?? this.drizzle.db;
    const { page, size, status, from, to } = options;
    const offset = (page - 1) * size;

    const conditions = [eq(bookings.personalId, personalId)];
    if (status) {
      conditions.push(eq(bookings.status, status));
    }
    if (from) {
      conditions.push(gte(bookings.scheduledDate, from));
    }
    if (to) {
      conditions.push(lte(bookings.scheduledDate, to));
    }

    const whereClause = and(...conditions);

    const [rows, [{ total }]] = await Promise.all([
      db
        .select(this.bookingSelect())
        .from(bookings)
        .innerJoin(students, eq(students.id, bookings.studentId))
        .innerJoin(users, eq(users.id, students.userId))
        .innerJoin(servicePlans, eq(servicePlans.id, bookings.servicePlanId))
        .where(whereClause)
        .orderBy(bookings.scheduledDate, bookings.startTime)
        .limit(size)
        .offset(offset),
      db.select({ total: count() }).from(bookings).where(whereClause),
    ]);

    return {
      content: rows,
      page,
      size,
      totalElements: Number(total),
      totalPages: Math.ceil(Number(total) / size),
    };
  }

  async updateStatus(
    id: string,
    personalId: string,
    status: string,
    tx?: DrizzleDb,
  ): Promise<BookingWithRelations | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .update(bookings)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .set({ status } as any)
      .where(and(eq(bookings.id, id), eq(bookings.personalId, personalId)))
      .returning();
    if (!result[0]) {
      return null;
    }
    return this.findById(result[0].id, personalId, db);
  }

  async cancel(
    id: string,
    personalId: string,
    reason: string,
    tx?: DrizzleDb,
  ): Promise<BookingWithRelations | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .update(bookings)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
        cancellationReason: reason,
      } as any)
      .where(and(eq(bookings.id, id), eq(bookings.personalId, personalId)))
      .returning();
    if (!result[0]) {
      return null;
    }
    return this.findById(result[0].id, personalId, db);
  }

  async cancelMany(
    ids: string[],
    personalId: string,
    reason: string,
    tx?: DrizzleDb,
  ): Promise<BookingWithRelations[]> {
    if (ids.length === 0) {
      return [];
    }

    const db = tx ?? this.drizzle.db;
    const result = await db
      .update(bookings)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
        cancellationReason: reason,
      } as any)
      .where(
        and(
          eq(bookings.personalId, personalId),
          inArray(bookings.id, ids),
          notInArray(bookings.status, ["completed", "cancelled"]),
        ),
      )
      .returning();
    return this.findManyByIds(
      result.map((booking) => booking.id),
      personalId,
      db,
    );
  }

  async countOpenBySeries(
    seriesId: string,
    personalId: string,
    tx?: DrizzleDb,
  ): Promise<number> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select({ total: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.seriesId, seriesId),
          eq(bookings.personalId, personalId),
          notInArray(bookings.status, ["completed", "cancelled"]),
        ),
      );

    return Number(result[0]?.total ?? 0);
  }
}
