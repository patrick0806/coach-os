import {
  pgTable,
  varchar,
  integer,
  boolean,
  timestamp,
  date,
  index,
  uniqueIndex,
  numeric,
  text,
} from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import { personals } from "./personals";
import { students } from "./students";

// Availability Slots — defines when personal trainers are available
export const availabilitySlots = pgTable(
  "availability_slots",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    personalId: varchar("personal_id", { length: 36 })
      .notNull()
      .references(() => personals.id),
    // Day of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    dayOfWeek: integer("day_of_week").notNull(),
    // Time in HH:mm format
    startTime: varchar("start_time", { length: 5 }).notNull(),
    endTime: varchar("end_time", { length: 5 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_availability_slots_personal_id").on(table.personalId),
    index("idx_availability_slots_day").on(table.dayOfWeek),
  ]
);

// Service Plans — training packages offered by personal trainers on their landing page
export const servicePlans = pgTable(
  "service_plans",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    personalId: varchar("personal_id", { length: 36 })
      .notNull()
      .references(() => personals.id),
    name: varchar("name", { length: 150 }).notNull(),
    description: text("description"),
    sessionsPerWeek: integer("sessions_per_week").notNull(),
    durationMinutes: integer("duration_minutes").notNull().default(60),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_service_plans_personal_id").on(table.personalId),
  ]
);

// Bookings — scheduled sessions between personal trainers and students
export const bookings = pgTable(
  "bookings",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    personalId: varchar("personal_id", { length: 36 })
      .notNull()
      .references(() => personals.id),
    studentId: varchar("student_id", { length: 36 })
      .notNull()
      .references(() => students.id),
    servicePlanId: varchar("service_plan_id", { length: 36 })
      .notNull()
      .references(() => servicePlans.id),
    seriesId: varchar("series_id", { length: 36 }).references(() => bookingSeries.id, {
      onDelete: "set null",
    }),
    scheduledDate: timestamp("scheduled_date", {
      withTimezone: true,
    }).notNull(),
    startTime: varchar("start_time", { length: 5 }).notNull(),
    endTime: varchar("end_time", { length: 5 }).notNull(),
    notes: text("notes"),
    // Status: "scheduled" | "completed" | "cancelled" | "no-show"
    status: varchar("status", { length: 20 }).notNull().default("scheduled"),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancellationReason: text("cancellation_reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_bookings_personal_id").on(table.personalId),
    index("idx_bookings_student_id").on(table.studentId),
    index("idx_bookings_date").on(table.scheduledDate),
    index("idx_bookings_status").on(table.status),
    // Prevent double-booking: same personal, same date, same start time
    uniqueIndex("uniq_booking_time").on(
      table.personalId,
      table.scheduledDate,
      table.startTime
    ),
  ]
);

export const bookingSeries = pgTable(
  "booking_series",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    personalId: varchar("personal_id", { length: 36 })
      .notNull()
      .references(() => personals.id),
    studentId: varchar("student_id", { length: 36 })
      .notNull()
      .references(() => students.id),
    servicePlanId: varchar("service_plan_id", { length: 36 })
      .notNull()
      .references(() => servicePlans.id),
    daysOfWeek: integer("days_of_week").array().notNull(),
    startTime: varchar("start_time", { length: 5 }).notNull(),
    endTime: varchar("end_time", { length: 5 }).notNull(),
    seriesStartDate: date("series_start_date").notNull(),
    seriesEndDate: date("series_end_date").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_booking_series_personal_id").on(table.personalId),
    index("idx_booking_series_start_date").on(table.seriesStartDate),
  ],
);

export const availabilitySlotsRelations = relations(
  availabilitySlots,
  ({ one }) => ({
    personal: one(personals, {
      fields: [availabilitySlots.personalId],
      references: [personals.id],
    }),
  })
);

export const servicePlansRelations = relations(
  servicePlans,
  ({ one, many }) => ({
    personal: one(personals, {
      fields: [servicePlans.personalId],
      references: [personals.id],
    }),
    bookings: many(bookings),
  })
);

export const bookingSeriesRelations = relations(bookingSeries, ({ one, many }) => ({
  personal: one(personals, {
    fields: [bookingSeries.personalId],
    references: [personals.id],
  }),
  student: one(students, {
    fields: [bookingSeries.studentId],
    references: [students.id],
  }),
  servicePlan: one(servicePlans, {
    fields: [bookingSeries.servicePlanId],
    references: [servicePlans.id],
  }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  personal: one(personals, {
    fields: [bookings.personalId],
    references: [personals.id],
  }),
  student: one(students, {
    fields: [bookings.studentId],
    references: [students.id],
  }),
  servicePlan: one(servicePlans, {
    fields: [bookings.servicePlanId],
    references: [servicePlans.id],
  }),
  series: one(bookingSeries, {
    fields: [bookings.seriesId],
    references: [bookingSeries.id],
  }),
}));

// Type exports
export type AvailabilitySlot = typeof availabilitySlots.$inferSelect;
export type NewAvailabilitySlot = typeof availabilitySlots.$inferInsert;

export type ServicePlan = typeof servicePlans.$inferSelect;
export type NewServicePlan = typeof servicePlans.$inferInsert;

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;

export type BookingSeries = typeof bookingSeries.$inferSelect;
export type NewBookingSeries = typeof bookingSeries.$inferInsert;
