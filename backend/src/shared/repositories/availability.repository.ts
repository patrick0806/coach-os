import { Injectable } from "@nestjs/common";
import { and, eq, lt, gt, ne } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import { availabilitySlots, AvailabilitySlot } from "@config/database/schema/availability";

type DrizzleDb = NodePgDatabase<typeof schema>;

export interface CreateAvailabilitySlotInput {
  personalId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface UpdateAvailabilitySlotInput {
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
}

@Injectable()
export class AvailabilityRepository {
  constructor(private drizzle: DrizzleProvider) {}

  async findConflicting(
    personalId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    excludeId?: string,
    tx?: DrizzleDb,
  ): Promise<AvailabilitySlot | null> {
    const db = tx ?? this.drizzle.db;
    const conditions = [
      eq(availabilitySlots.personalId, personalId),
      eq(availabilitySlots.dayOfWeek, dayOfWeek),
      // Two intervals [a1,a2] and [b1,b2] overlap when: a1 < b2 AND b1 < a2
      lt(availabilitySlots.startTime, endTime),
      gt(availabilitySlots.endTime, startTime),
    ];
    if (excludeId) {
      conditions.push(ne(availabilitySlots.id, excludeId));
    }
    const result = await db
      .select()
      .from(availabilitySlots)
      .where(and(...conditions))
      .limit(1);
    return result[0] ?? null;
  }

  async findByPersonalId(personalId: string, tx?: DrizzleDb): Promise<AvailabilitySlot[]> {
    const db = tx ?? this.drizzle.db;
    return db
      .select()
      .from(availabilitySlots)
      .where(eq(availabilitySlots.personalId, personalId))
      .orderBy(availabilitySlots.dayOfWeek, availabilitySlots.startTime);
  }

  async findByDay(
    personalId: string,
    dayOfWeek: number,
    tx?: DrizzleDb,
  ): Promise<AvailabilitySlot[]> {
    const db = tx ?? this.drizzle.db;
    return db
      .select()
      .from(availabilitySlots)
      .where(and(eq(availabilitySlots.personalId, personalId), eq(availabilitySlots.dayOfWeek, dayOfWeek)))
      .orderBy(availabilitySlots.startTime);
  }

  async findOwnedById(
    id: string,
    personalId: string,
    tx?: DrizzleDb,
  ): Promise<AvailabilitySlot | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select()
      .from(availabilitySlots)
      .where(and(eq(availabilitySlots.id, id), eq(availabilitySlots.personalId, personalId)))
      .limit(1);
    return result[0] ?? null;
  }

  async create(
    data: CreateAvailabilitySlotInput,
    tx?: DrizzleDb,
  ): Promise<AvailabilitySlot> {
    const db = tx ?? this.drizzle.db;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await db.insert(availabilitySlots).values(data as any).returning();
    return result[0];
  }

  async createMany(
    data: CreateAvailabilitySlotInput[],
    tx?: DrizzleDb,
  ): Promise<AvailabilitySlot[]> {
    if (data.length === 0) {
      return [];
    }

    const db = tx ?? this.drizzle.db;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return db.insert(availabilitySlots).values(data as any).returning();
  }

  async update(
    id: string,
    personalId: string,
    data: UpdateAvailabilitySlotInput,
    tx?: DrizzleDb,
  ): Promise<AvailabilitySlot | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .update(availabilitySlots)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .set(data as any)
      .where(and(eq(availabilitySlots.id, id), eq(availabilitySlots.personalId, personalId)))
      .returning();
    return result[0] ?? null;
  }

  async delete(id: string, personalId: string, tx?: DrizzleDb): Promise<void> {
    const db = tx ?? this.drizzle.db;
    await db
      .delete(availabilitySlots)
      .where(and(eq(availabilitySlots.id, id), eq(availabilitySlots.personalId, personalId)));
  }

  async deleteByDay(personalId: string, dayOfWeek: number, tx?: DrizzleDb): Promise<void> {
    const db = tx ?? this.drizzle.db;
    await db
      .delete(availabilitySlots)
      .where(and(eq(availabilitySlots.personalId, personalId), eq(availabilitySlots.dayOfWeek, dayOfWeek)));
  }
}
