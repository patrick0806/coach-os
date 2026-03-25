import "dotenv/config";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getDatabaseConfig } from "./database.config";
import {
  availabilityRules,
  availabilityExceptions,
  appointments,
  trainingSchedules,
  trainingScheduleExceptions,
  workingHours,
  recurringSlots,
  calendarEvents,
} from "./schema";

// Drizzle ORM type inference excludes optional/defaulted columns from insert types.
// This helper bypasses the limitation for migration data only.
function sv<T>(v: T): any {
  return v;
}

async function migrateSchedulingData() {
  const pool = new Pool(getDatabaseConfig());
  const db = drizzle(pool);

  console.log("Starting scheduling data migration...\n");

  // Track old -> new ID mappings for training_schedules -> recurring_slots
  const scheduleIdMap = new Map<string, string>();

  let migratedWorkingHours = 0;
  let migratedRecurringSlots = 0;
  let migratedCalendarEvents = 0;

  // 1. Migrate availability_rules -> working_hours
  console.log("1. Migrating availability_rules -> working_hours...");
  const rules = await db.select().from(availabilityRules);

  for (const rule of rules) {
    const effectiveFrom = rule.createdAt
      ? rule.createdAt.toISOString().split("T")[0]
      : "2025-01-01";

    await db.insert(workingHours).values(sv({
      tenantId: rule.tenantId,
      dayOfWeek: rule.dayOfWeek,
      startTime: rule.startTime,
      endTime: rule.endTime,
      effectiveFrom,
      effectiveTo: rule.isActive ? undefined : effectiveFrom,
      isActive: rule.isActive ?? true,
    }));

    migratedWorkingHours++;
  }
  console.log(`   Migrated ${migratedWorkingHours} availability rules -> working_hours`);

  // 2. Migrate training_schedules -> recurring_slots
  console.log("2. Migrating training_schedules -> recurring_slots...");
  const schedules = await db.select().from(trainingSchedules);

  for (const schedule of schedules) {
    const newId = randomUUID();
    const effectiveFrom = schedule.createdAt
      ? schedule.createdAt.toISOString().split("T")[0]
      : "2025-01-01";

    scheduleIdMap.set(schedule.id, newId);

    await db.insert(recurringSlots).values(sv({
      id: newId,
      tenantId: schedule.tenantId,
      studentId: schedule.studentId,
      studentProgramId: schedule.studentProgramId ?? undefined,
      type: "booking",
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      location: schedule.location ?? undefined,
      effectiveFrom,
      effectiveTo: schedule.isActive ? undefined : effectiveFrom,
      isActive: schedule.isActive ?? true,
    }));

    migratedRecurringSlots++;
  }
  console.log(`   Migrated ${migratedRecurringSlots} training_schedules -> recurring_slots`);

  // 3. Migrate appointments -> calendar_events (type: one_off)
  console.log("3. Migrating appointments -> calendar_events (one_off)...");
  const allAppointments = await db.select().from(appointments);

  for (const apt of allAppointments) {
    await db.insert(calendarEvents).values(sv({
      tenantId: apt.tenantId,
      studentId: apt.studentId,
      startAt: apt.startAt,
      endAt: apt.endAt,
      type: "one_off",
      status: apt.status,
      appointmentType: apt.appointmentType,
      meetingUrl: apt.meetingUrl ?? undefined,
      location: apt.location ?? undefined,
      notes: apt.notes ?? undefined,
      cancelledAt: apt.cancelledAt ?? undefined,
      cancellationReason: apt.cancellationReason ?? undefined,
    }));

    migratedCalendarEvents++;
  }
  console.log(`   Migrated ${allAppointments.length} appointments -> calendar_events (one_off)`);

  // 4. Migrate availability_exceptions -> calendar_events (type: block)
  console.log("4. Migrating availability_exceptions -> calendar_events (block)...");
  const exceptions = await db.select().from(availabilityExceptions);
  let migratedBlocks = 0;

  for (const exc of exceptions) {
    const startAt = new Date(`${exc.exceptionDate}T00:00:00Z`);
    const endAt = new Date(`${exc.exceptionDate}T23:59:59Z`);

    await db.insert(calendarEvents).values(sv({
      tenantId: exc.tenantId,
      startAt,
      endAt,
      type: "block",
      status: "scheduled",
      notes: exc.reason ?? undefined,
    }));

    migratedBlocks++;
    migratedCalendarEvents++;
  }
  console.log(`   Migrated ${migratedBlocks} availability_exceptions -> calendar_events (block)`);

  // 5. Migrate training_schedule_exceptions -> calendar_events (type: override)
  console.log("5. Migrating training_schedule_exceptions -> calendar_events (override)...");
  const tsExceptions = await db.select().from(trainingScheduleExceptions);
  let migratedOverrides = 0;

  for (const exc of tsExceptions) {
    const newRecurringSlotId = scheduleIdMap.get(exc.trainingScheduleId);

    if (!newRecurringSlotId) {
      console.warn(
        `   WARNING: No recurring_slot mapping found for training_schedule_id=${exc.trainingScheduleId} (exception ${exc.id}). Skipping.`,
      );
      continue;
    }

    // Find the parent schedule to get the original startTime/endTime
    const parentSchedule = schedules.find((s) => s.id === exc.trainingScheduleId);
    if (!parentSchedule) {
      console.warn(
        `   WARNING: Parent schedule not found for exception ${exc.id}. Skipping.`,
      );
      continue;
    }

    // Compute originalStartAt from originalDate + parent schedule's startTime
    const originalStartAt = new Date(
      `${exc.originalDate}T${parentSchedule.startTime}:00Z`,
    );

    if (exc.action === "skip") {
      // Skip -> override with status cancelled
      const originalEndAt = new Date(
        `${exc.originalDate}T${parentSchedule.endTime}:00Z`,
      );

      await db.insert(calendarEvents).values(sv({
        tenantId: exc.tenantId,
        studentId: parentSchedule.studentId,
        startAt: originalStartAt,
        endAt: originalEndAt,
        type: "override",
        recurringSlotId: newRecurringSlotId,
        originalStartAt,
        status: "cancelled",
        notes: exc.reason ?? undefined,
      }));
    } else if (exc.action === "reschedule") {
      // Reschedule -> override with new date/time
      const newStartTime = exc.newStartTime ?? parentSchedule.startTime;
      const newEndTime = exc.newEndTime ?? parentSchedule.endTime;

      const startAt = new Date(`${exc.newDate}T${newStartTime}:00Z`);
      const endAt = new Date(`${exc.newDate}T${newEndTime}:00Z`);

      await db.insert(calendarEvents).values(sv({
        tenantId: exc.tenantId,
        studentId: parentSchedule.studentId,
        startAt,
        endAt,
        type: "override",
        recurringSlotId: newRecurringSlotId,
        originalStartAt,
        status: "scheduled",
        location: exc.newLocation ?? parentSchedule.location ?? undefined,
        notes: exc.reason ?? undefined,
      }));
    }

    migratedOverrides++;
    migratedCalendarEvents++;
  }
  console.log(`   Migrated ${migratedOverrides} training_schedule_exceptions -> calendar_events (override)`);

  // Summary
  console.log("\n--- Migration Summary ---");
  console.log(`Working hours:    ${migratedWorkingHours}`);
  console.log(`Recurring slots:  ${migratedRecurringSlots}`);
  console.log(`Calendar events:  ${migratedCalendarEvents}`);
  console.log(`  - one_off:      ${allAppointments.length}`);
  console.log(`  - block:        ${migratedBlocks}`);
  console.log(`  - override:     ${migratedOverrides}`);
  console.log("------------------------\n");

  await pool.end();
  console.log("Migration completed successfully!");
}

migrateSchedulingData().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
