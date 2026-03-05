import {
  pgTable,
  varchar,
  integer,
  boolean,
  timestamp,
  index,
  uniqueIndex,
  numeric,
  text,
} from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";

// Availability Slots - Define when personal trainers are available
export const availabilitySlots = pgTable(
  "availability_slots",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    personalId: varchar("personal_id", { length: 36 }).notNull(),

    // Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
    dayOfWeek: integer("day_of_week").notNull(),

    // Time slots in HH:mm format
    startTime: varchar("start_time", { length: 5 }).notNull(),
    endTime: varchar("end_time", { length: 5 }).notNull(),

    // Active status
    isActive: boolean("is_active").default(true),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_availability_slots_personal_id").on(table.personalId),
    index("idx_availability_slots_day").on(table.dayOfWeek),
  ]
);

// Service Plans - Training/attendance plans offered by personal trainers
export const servicePlans = pgTable(
  "service_plans",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    personalId: varchar("personal_id", { length: 36 }).notNull(),

    name: varchar("name", { length: 150 }).notNull(),
    description: text("description"),

    // Frequency configuration
    sessionsPerWeek: integer("sessions_per_week").notNull(),

    // Duration in minutes (default 60)
    durationMinutes: integer("duration_minutes").notNull().default(60),

    // Pricing
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),

    // Active status
    isActive: boolean("is_active").default(true),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_service_plans_personal_id").on(table.personalId),
  ]
);

// Bookings - Scheduled sessions between personal trainers and students
export const bookings = pgTable(
  "bookings",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    personalId: varchar("personal_id", { length: 36 }).notNull(),
    studentId: varchar("student_id", { length: 36 }).notNull(),
    servicePlanId: varchar("service_plan_id", { length: 36 }).notNull(),

    // Scheduled time
    scheduledDate: timestamp("scheduled_date", { withTimezone: true }).notNull(),
    startTime: varchar("start_time", { length: 5 }).notNull(),
    endTime: varchar("end_time", { length: 5 }).notNull(),

    // Session notes
    notes: text("notes"),

    // Status: "scheduled", "completed", "cancelled", "no-show"
    status: varchar("status", { length: 20 }).notNull().default("scheduled"),

    // Cancellation tracking
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancellationReason: text("cancellation_reason"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_bookings_personal_id").on(table.personalId),
    index("idx_bookings_student_id").on(table.studentId),
    index("idx_bookings_date").on(table.scheduledDate),
    index("idx_bookings_status").on(table.status),
    // Prevent double-booking
    uniqueIndex("uniq_booking_time").on(
      table.personalId,
      table.scheduledDate,
      table.startTime
    ),
  ]
);

// Type exports
export type AvailabilitySlot = typeof availabilitySlots.$inferSelect;
export type NewAvailabilitySlot = typeof availabilitySlots.$inferInsert;

export type ServicePlan = typeof servicePlans.$inferSelect;
export type NewServicePlan = typeof servicePlans.$inferInsert;

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
