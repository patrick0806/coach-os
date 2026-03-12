import { Injectable } from "@nestjs/common";
import { and, eq, lt, gt, ne, lte, gte } from "drizzle-orm";
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

  // Returns true if there is at least one active slot for the given personal and day.
  async hasActiveForDay(
    personalId: string,
    dayOfWeek: number,
    tx?: DrizzleDb,
  ): Promise<boolean> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select({ id: availabilitySlots.id })
      .from(availabilitySlots)
      .where(
        and(
          eq(availabilitySlots.personalId, personalId),
          eq(availabilitySlots.dayOfWeek, dayOfWeek),
          eq(availabilitySlots.isActive, true),
        ),
      )
      .limit(1);
    return result.length > 0;
  }

  // Returns the first active slot that fully covers [startTime, endTime] for a given day.
  // Coverage means: slot.startTime <= startTime AND slot.endTime >= endTime
  async findCovering(
    personalId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    tx?: DrizzleDb,
  ): Promise<AvailabilitySlot | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select()
      .from(availabilitySlots)
      .where(
        and(
          eq(availabilitySlots.personalId, personalId),
          eq(availabilitySlots.dayOfWeek, dayOfWeek),
          eq(availabilitySlots.isActive, true),
          lte(availabilitySlots.startTime, startTime),
          gte(availabilitySlots.endTime, endTime),
        ),
      )
      .limit(1);
    return result[0] ?? null;
  }

  async deleteByDay(personalId: string, dayOfWeek: number, tx?: DrizzleDb): Promise<void> {
    const db = tx ?? this.drizzle.db;
    await db
      .delete(availabilitySlots)
      .where(and(eq(availabilitySlots.personalId, personalId), eq(availabilitySlots.dayOfWeek, dayOfWeek)));
  }
}
