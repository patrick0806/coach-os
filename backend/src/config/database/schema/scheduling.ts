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

// Availability Rules
export const availabilityRules = pgTable(
  "availability_rules",
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
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("availability_rules_tenant_id_idx").on(table.tenantId),
  ],
);

export const availabilityRulesRelations = relations(
  availabilityRules,
  ({ one }) => ({
    tenant: one(personals, {
      fields: [availabilityRules.tenantId],
      references: [personals.id],
    }),
  }),
);

// Availability Exceptions
export const availabilityExceptions = pgTable(
  "availability_exceptions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => personals.id),
    exceptionDate: date("exception_date").notNull(),
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("availability_exceptions_tenant_id_idx").on(table.tenantId),
  ],
);

export const availabilityExceptionsRelations = relations(
  availabilityExceptions,
  ({ one }) => ({
    tenant: one(personals, {
      fields: [availabilityExceptions.tenantId],
      references: [personals.id],
    }),
  }),
);

// Appointment Requests
export const appointmentRequests = pgTable(
  "appointment_requests",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => personals.id),
    studentId: varchar("student_id", { length: 36 })
      .notNull()
      .references(() => students.id),
    requestedDate: timestamp("requested_date", {
      withTimezone: true,
    }).notNull(),
    requestedStartTime: varchar("requested_start_time", {
      length: 5,
    }).notNull(),
    requestedEndTime: varchar("requested_end_time", { length: 5 }).notNull(),
    status: varchar("status", { length: 20 })
      .notNull()
      .$type<"pending" | "approved" | "rejected">(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("appointment_requests_tenant_id_idx").on(table.tenantId),
    index("appointment_requests_student_id_idx").on(table.studentId),
  ],
);

export const appointmentRequestsRelations = relations(
  appointmentRequests,
  ({ one }) => ({
    tenant: one(personals, {
      fields: [appointmentRequests.tenantId],
      references: [personals.id],
    }),
    student: one(students, {
      fields: [appointmentRequests.studentId],
      references: [students.id],
    }),
  }),
);

// Appointments
export const appointments = pgTable(
  "appointments",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => personals.id),
    studentId: varchar("student_id", { length: 36 })
      .notNull()
      .references(() => students.id),
    appointmentRequestId: varchar("appointment_request_id", {
      length: 36,
    }).references(() => appointmentRequests.id),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    appointmentType: varchar("appointment_type", { length: 20 })
      .notNull()
      .$type<"online" | "presential">(),
    status: varchar("status", { length: 20 })
      .notNull()
      .$type<"scheduled" | "completed" | "cancelled" | "no_show">(),
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
    index("appointments_tenant_id_idx").on(table.tenantId),
    index("appointments_student_id_idx").on(table.studentId),
    index("appointments_start_at_idx").on(table.startAt),
  ],
);

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  tenant: one(personals, {
    fields: [appointments.tenantId],
    references: [personals.id],
  }),
  student: one(students, {
    fields: [appointments.studentId],
    references: [students.id],
  }),
  appointmentRequest: one(appointmentRequests, {
    fields: [appointments.appointmentRequestId],
    references: [appointmentRequests.id],
  }),
}));
