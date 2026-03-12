import {
  pgTable,
  varchar,
  integer,
  boolean,
  timestamp,
  date,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import { personals } from "./personals";
import { students } from "./students";
import { workoutPlans } from "./workout";
import { workoutSessions } from "./workout";

// Schedule Rules — defines the weekly recurring training pattern for a student
export const scheduleRules = pgTable(
  "schedule_rules",
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
    // Day of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    dayOfWeek: integer("day_of_week").notNull(),
    // null = rest day; set = workout assigned to this day (e.g., Treino A, B, C)
    workoutPlanId: varchar("workout_plan_id", { length: 36 }).references(
      () => workoutPlans.id,
      { onDelete: "set null" }
    ),
    // HH:mm format — only relevant for presential sessions
    startTime: varchar("start_time", { length: 5 }),
    endTime: varchar("end_time", { length: 5 }),
    // Session type: "presential" | "online" | "rest"
    sessionType: varchar("session_type", { length: 20 })
      .$type<"presential" | "online" | "rest">()
      .notNull()
      .default("online"),
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
    index("idx_schedule_rules_personal_id").on(table.personalId),
    index("idx_schedule_rules_student_id").on(table.studentId),
    // One rule per student per day of the week
    uniqueIndex("uniq_schedule_rule_student_day").on(
      table.studentId,
      table.dayOfWeek
    ),
  ]
);

// Training Sessions — concrete instances generated from schedule_rules (up to 60 days ahead)
export const trainingSessions = pgTable(
  "training_sessions",
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
    // The rule that generated this session — cascade delete removes pending sessions when rule is deleted
    scheduleRuleId: varchar("schedule_rule_id", { length: 36 })
      .notNull()
      .references(() => scheduleRules.id, { onDelete: "cascade" }),
    // null for rest days
    workoutPlanId: varchar("workout_plan_id", { length: 36 }).references(
      () => workoutPlans.id,
      { onDelete: "set null" }
    ),
    // Linked when student actually starts the workout execution
    workoutSessionId: varchar("workout_session_id", { length: 36 }).references(
      () => workoutSessions.id,
      { onDelete: "set null" }
    ),
    scheduledDate: date("scheduled_date").notNull(),
    // HH:mm format — inherited from schedule_rule at generation time
    startTime: varchar("start_time", { length: 5 }),
    endTime: varchar("end_time", { length: 5 }),
    // Status: "pending" | "completed" | "cancelled"
    status: varchar("status", { length: 20 })
      .$type<"pending" | "completed" | "cancelled">()
      .notNull()
      .default("pending"),
    // Session type inherited from schedule_rule at generation time
    sessionType: varchar("session_type", { length: 20 })
      .$type<"presential" | "online" | "rest">()
      .notNull()
      .default("online"),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancellationReason: text("cancellation_reason"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_training_sessions_personal_id").on(table.personalId),
    index("idx_training_sessions_student_id").on(table.studentId),
    index("idx_training_sessions_scheduled_date").on(table.scheduledDate),
    index("idx_training_sessions_status").on(table.status),
    // Prevent duplicate sessions: same student, same date, from the same rule
    uniqueIndex("uniq_training_session_student_date_rule").on(
      table.studentId,
      table.scheduledDate,
      table.scheduleRuleId
    ),
  ]
);

export const scheduleRulesRelations = relations(
  scheduleRules,
  ({ one, many }) => ({
    personal: one(personals, {
      fields: [scheduleRules.personalId],
      references: [personals.id],
    }),
    student: one(students, {
      fields: [scheduleRules.studentId],
      references: [students.id],
    }),
    workoutPlan: one(workoutPlans, {
      fields: [scheduleRules.workoutPlanId],
      references: [workoutPlans.id],
    }),
    trainingSessions: many(trainingSessions),
  })
);

export const trainingSessionsRelations = relations(
  trainingSessions,
  ({ one }) => ({
    personal: one(personals, {
      fields: [trainingSessions.personalId],
      references: [personals.id],
    }),
    student: one(students, {
      fields: [trainingSessions.studentId],
      references: [students.id],
    }),
    scheduleRule: one(scheduleRules, {
      fields: [trainingSessions.scheduleRuleId],
      references: [scheduleRules.id],
    }),
    workoutPlan: one(workoutPlans, {
      fields: [trainingSessions.workoutPlanId],
      references: [workoutPlans.id],
    }),
    workoutSession: one(workoutSessions, {
      fields: [trainingSessions.workoutSessionId],
      references: [workoutSessions.id],
    }),
  })
);

// Type exports
export type ScheduleRule = typeof scheduleRules.$inferSelect;
export type NewScheduleRule = typeof scheduleRules.$inferInsert;

export type TrainingSession = typeof trainingSessions.$inferSelect;
export type NewTrainingSession = typeof trainingSessions.$inferInsert;
