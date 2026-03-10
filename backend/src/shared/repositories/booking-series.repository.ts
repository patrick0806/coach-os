import { Injectable } from "@nestjs/common";
import { and, eq, gte } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import { bookingSeries, BookingSeries } from "@config/database/schema/availability";

type DrizzleDb = NodePgDatabase<typeof schema>;

export interface CreateBookingSeriesInput {
  personalId: string;
  studentId: string;
  servicePlanId: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  seriesStartDate: string;
  seriesEndDate: string;
  notes?: string | null;
}

@Injectable()
export class BookingSeriesRepository {
  constructor(private drizzle: DrizzleProvider) {}

  async create(data: CreateBookingSeriesInput, tx?: DrizzleDb): Promise<BookingSeries> {
    const db = tx ?? this.drizzle.db;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await db.insert(bookingSeries).values(data as any).returning();
    return result[0];
  }

  async delete(id: string, tx?: DrizzleDb): Promise<void> {
    const db = tx ?? this.drizzle.db;
    await db.delete(bookingSeries).where(eq(bookingSeries.id, id));
  }

  async findActiveByPersonal(personalId: string, tx?: DrizzleDb): Promise<BookingSeries[]> {
    const db = tx ?? this.drizzle.db;

    const today = new Date();
    const year = today.getUTCFullYear();
    const month = String(today.getUTCMonth() + 1).padStart(2, "0");
    const day = String(today.getUTCDate()).padStart(2, "0");
    const isoDate = `${year}-${month}-${day}`;

    return db
      .select()
      .from(bookingSeries)
      .where(
        and(
          eq(bookingSeries.personalId, personalId),
          gte(bookingSeries.seriesEndDate, isoDate),
        ),
      )
      .orderBy(bookingSeries.seriesStartDate, bookingSeries.startTime);
  }
}
