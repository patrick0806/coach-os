import { Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import { scheduleRules, ScheduleRule, NewScheduleRule } from "@config/database/schema/schedule";

type DrizzleDb = NodePgDatabase<typeof schema>;

export interface UpsertScheduleRuleInput {
  personalId: string;
  studentId: string;
  dayOfWeek: number;
  workoutPlanId?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  sessionType: "presential" | "online" | "rest";
}

@Injectable()
export class ScheduleRulesRepository {
  constructor(private drizzle: DrizzleProvider) {}

  async findAllActive(tx?: DrizzleDb): Promise<ScheduleRule[]> {
    const db = tx ?? this.drizzle.db;
    return db
      .select()
      .from(scheduleRules)
      .where(eq(scheduleRules.isActive, true));
  }

  async findByStudent(studentId: string, personalId: string, tx?: DrizzleDb): Promise<ScheduleRule[]> {
    const db = tx ?? this.drizzle.db;
    return db
      .select()
      .from(scheduleRules)
      .where(
        and(
          eq(scheduleRules.personalId, personalId),
          eq(scheduleRules.studentId, studentId),
        ),
      );
  }

  // Returns active presential rules for a personal on a given day of week.
  // Used by the public availability engine to compute occupied slots.
  async findActivePresentialByDay(
    personalId: string,
    dayOfWeek: number,
    tx?: DrizzleDb,
  ): Promise<ScheduleRule[]> {
    const db = tx ?? this.drizzle.db;
    return db
      .select()
      .from(scheduleRules)
      .where(
        and(
          eq(scheduleRules.personalId, personalId),
          eq(scheduleRules.dayOfWeek, dayOfWeek),
          eq(scheduleRules.sessionType, "presential"),
          eq(scheduleRules.isActive, true),
        ),
      );
  }

  async upsert(data: UpsertScheduleRuleInput, tx?: DrizzleDb): Promise<ScheduleRule> {
    const db = tx ?? this.drizzle.db;
    const result = await (db as any)
      .insert(scheduleRules)
      .values(data as NewScheduleRule)
      .onConflictDoUpdate({
        target: [scheduleRules.studentId, scheduleRules.dayOfWeek],
        set: {
          workoutPlanId: data.workoutPlanId ?? null,
          startTime: data.startTime ?? null,
          endTime: data.endTime ?? null,
          sessionType: data.sessionType,
          isActive: true,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }

  async deactivate(id: string, personalId: string, tx?: DrizzleDb): Promise<void> {
    const db = tx ?? this.drizzle.db;
    await (db as any)
      .update(scheduleRules)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(scheduleRules.id, id), eq(scheduleRules.personalId, personalId)));
  }
}
