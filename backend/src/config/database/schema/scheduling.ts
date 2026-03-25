import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { personals } from "./personals";
import { students } from "./students";
import { studentPrograms } from "./training";

// Working Hours
export const workingHours = pgTable(
  "working_hours",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => personals.id),
    dayOfWeek: integer("day_of_week").notNull(),
    startTime: varchar("start_time", { length: 5 }).notNull(),
    endTime: varchar("end_time", { length: 5 }).notNull(),
    effectiveFrom: date("effective_from").notNull(),
    effectiveTo: date("effective_to"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("working_hours_tenant_id_active_idx").on(
      table.tenantId,
      table.isActive,
    ),
  ],
);

export const workingHoursRelations = relations(workingHours, ({ one }) => ({
  tenant: one(personals, {
    fields: [workingHours.tenantId],
    references: [personals.id],
  }),
}));

// Recurring Slots
export const recurringSlots = pgTable(
  "recurring_slots",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => personals.id),
    studentId: varchar("student_id", { length: 36 }).references(
      () => students.id,
    ),
    studentProgramId: varchar("student_program_id", {
      length: 36,
    }).references(() => studentPrograms.id),
    type: varchar("type", { length: 20 })
      .notNull()
      .$type<"booking" | "block">(),
    dayOfWeek: integer("day_of_week").notNull(),
    startTime: varchar("start_time", { length: 5 }).notNull(),
    endTime: varchar("end_time", { length: 5 }).notNull(),
    location: varchar("location", { length: 300 }),
    effectiveFrom: date("effective_from").notNull(),
    effectiveTo: date("effective_to"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("recurring_slots_tenant_id_active_idx").on(
      table.tenantId,
      table.isActive,
    ),
    index("recurring_slots_tenant_id_student_id_idx").on(
      table.tenantId,
      table.studentId,
    ),
    index("recurring_slots_tenant_id_day_of_week_idx").on(
      table.tenantId,
      table.dayOfWeek,
    ),
  ],
);

export const recurringSlotsRelations = relations(
  recurringSlots,
  ({ one, many }) => ({
    tenant: one(personals, {
      fields: [recurringSlots.tenantId],
      references: [personals.id],
    }),
    student: one(students, {
      fields: [recurringSlots.studentId],
      references: [students.id],
    }),
    studentProgram: one(studentPrograms, {
      fields: [recurringSlots.studentProgramId],
      references: [studentPrograms.id],
    }),
    calendarEvents: many(calendarEvents),
  }),
);

// Calendar Events
export const calendarEvents = pgTable(
  "calendar_events",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => personals.id),
    studentId: varchar("student_id", { length: 36 }).references(
      () => students.id,
    ),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    type: varchar("type", { length: 20 })
      .notNull()
      .$type<"one_off" | "override" | "block">(),
    recurringSlotId: varchar("recurring_slot_id", { length: 36 }).references(
      () => recurringSlots.id,
    ),
    originalStartAt: timestamp("original_start_at", { withTimezone: true }),
    status: varchar("status", { length: 20 })
      .notNull()
      .$type<"scheduled" | "cancelled" | "completed" | "no_show">(),
    appointmentType: varchar("appointment_type", { length: 20 }).$type<
      "online" | "presential"
    >(),
    meetingUrl: varchar("meeting_url", { length: 500 }),
    location: varchar("location", { length: 300 }),
    notes: text("notes"),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancellationReason: text("cancellation_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("calendar_events_tenant_id_start_at_idx").on(
      table.tenantId,
      table.startAt,
    ),
    index("calendar_events_tenant_id_recurring_slot_id_idx").on(
      table.tenantId,
      table.recurringSlotId,
    ),
    index("calendar_events_tenant_id_student_id_start_at_idx").on(
      table.tenantId,
      table.studentId,
      table.startAt,
    ),
    index("calendar_events_tenant_id_status_start_at_idx").on(
      table.tenantId,
      table.status,
      table.startAt,
    ),
  ],
);

export const calendarEventsRelations = relations(
  calendarEvents,
  ({ one }) => ({
    tenant: one(personals, {
      fields: [calendarEvents.tenantId],
      references: [personals.id],
    }),
    student: one(students, {
      fields: [calendarEvents.studentId],
      references: [students.id],
    }),
    recurringSlot: one(recurringSlots, {
      fields: [calendarEvents.recurringSlotId],
      references: [recurringSlots.id],
    }),
  }),
);
