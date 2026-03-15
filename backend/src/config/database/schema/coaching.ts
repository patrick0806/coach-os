import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import {
  index,
  numeric,
  pgTable,
  text,
  boolean,
  integer,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { personals } from "./personals";
import { students } from "./students";

// Coach-Student Relations
export const coachStudentRelations = pgTable(
  "coach_student_relations",
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
    status: varchar("status", { length: 20 })
      .notNull()
      .$type<"active" | "paused" | "archived">(),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("coach_student_relations_tenant_id_idx").on(table.tenantId),
    index("coach_student_relations_student_id_idx").on(table.studentId),
  ],
);

export const coachStudentRelationsRelations = relations(
  coachStudentRelations,
  ({ one }) => ({
    tenant: one(personals, {
      fields: [coachStudentRelations.tenantId],
      references: [personals.id],
    }),
    student: one(students, {
      fields: [coachStudentRelations.studentId],
      references: [students.id],
    }),
  }),
);

// Service Plans
export const servicePlans = pgTable(
  "service_plans",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => personals.id),
    name: varchar("name", { length: 150 }).notNull(),
    description: text("description"),
    sessionsPerWeek: integer("sessions_per_week"),
    durationMinutes: integer("duration_minutes"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    attendanceType: varchar("attendance_type", { length: 20 })
      .notNull()
      .$type<"online" | "presential">(),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("service_plans_tenant_id_idx").on(table.tenantId)],
);

export const servicePlansRelations = relations(servicePlans, ({ one }) => ({
  tenant: one(personals, {
    fields: [servicePlans.tenantId],
    references: [personals.id],
  }),
}));

// Coaching Contracts
export const coachingContracts = pgTable(
  "coaching_contracts",
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
    servicePlanId: varchar("service_plan_id", { length: 36 })
      .notNull()
      .references(() => servicePlans.id),
    status: varchar("status", { length: 20 })
      .notNull()
      .$type<"active" | "cancelled" | "expired">(),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("coaching_contracts_tenant_id_idx").on(table.tenantId),
    index("coaching_contracts_student_id_idx").on(table.studentId),
  ],
);

export const coachingContractsRelations = relations(
  coachingContracts,
  ({ one }) => ({
    tenant: one(personals, {
      fields: [coachingContracts.tenantId],
      references: [personals.id],
    }),
    student: one(students, {
      fields: [coachingContracts.studentId],
      references: [students.id],
    }),
    servicePlan: one(servicePlans, {
      fields: [coachingContracts.servicePlanId],
      references: [servicePlans.id],
    }),
  }),
);

// Student Notes
export const studentNotes = pgTable(
  "student_notes",
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
    note: text("note").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("student_notes_tenant_id_idx").on(table.tenantId),
    index("student_notes_student_id_idx").on(table.studentId),
  ],
);

export const studentNotesRelations = relations(studentNotes, ({ one }) => ({
  tenant: one(personals, {
    fields: [studentNotes.tenantId],
    references: [personals.id],
  }),
  student: one(students, {
    fields: [studentNotes.studentId],
    references: [students.id],
  }),
}));
