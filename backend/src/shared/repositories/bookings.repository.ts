import { Injectable } from "@nestjs/common";
import { and, eq, count } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import {
  bookings,
  Booking,
  availabilitySlots,
} from "@config/database/schema/availability";

type DrizzleDb = NodePgDatabase<typeof schema>;

export interface CreateBookingInput {
  personalId: string;
  studentId: string;
  servicePlanId: string;
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
  content: Booking[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

@Injectable()
export class BookingsRepository {
  constructor(private drizzle: DrizzleProvider) {}

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

  async create(data: CreateBookingInput, tx?: DrizzleDb): Promise<Booking> {
    const db = tx ?? this.drizzle.db;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await db.insert(bookings).values(data as any).returning();
    return result[0];
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
        .select()
        .from(bookings)
        .where(
          and(eq(bookings.studentId, studentId), eq(bookings.personalId, personalId)),
        )
        .orderBy(bookings.scheduledDate)
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

  async findById(id: string, personalId: string, tx?: DrizzleDb): Promise<Booking | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, id), eq(bookings.personalId, personalId)))
      .limit(1);
    return result[0] ?? null;
  }

  async findByPersonal(
    personalId: string,
    options: { page: number; size: number; status?: string; from?: Date; to?: Date },
    tx?: DrizzleDb,
  ): Promise<PaginatedBookings> {
    const db = tx ?? this.drizzle.db;
    const { page, size, status } = options;
    const offset = (page - 1) * size;

    const conditions = [eq(bookings.personalId, personalId)];
    if (status) {
      conditions.push(eq(bookings.status, status));
    }

    const whereClause = and(...conditions);

    const [rows, [{ total }]] = await Promise.all([
      db
        .select()
        .from(bookings)
        .where(whereClause)
        .orderBy(bookings.scheduledDate)
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
  ): Promise<Booking | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .update(bookings)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .set({ status } as any)
      .where(and(eq(bookings.id, id), eq(bookings.personalId, personalId)))
      .returning();
    return result[0] ?? null;
  }

  async cancel(
    id: string,
    personalId: string,
    reason: string,
    tx?: DrizzleDb,
  ): Promise<Booking | null> {
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
    return result[0] ?? null;
  }
}
