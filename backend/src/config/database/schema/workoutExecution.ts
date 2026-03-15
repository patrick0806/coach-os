import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  numeric,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { exercises } from "./exercises";
import { personals } from "./personals";
import { students } from "./students";
import { studentExercises, workoutDays } from "./training";

// Workout Sessions
export const workoutSessions = pgTable(
  "workout_sessions",
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
    workoutDayId: varchar("workout_day_id", { length: 36 })
      .notNull()
      .references(() => workoutDays.id),
    status: varchar("status", { length: 20 })
      .notNull()
      .$type<"started" | "paused" | "finished" | "skipped">(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("workout_sessions_tenant_id_idx").on(table.tenantId),
    index("workout_sessions_student_id_idx").on(table.studentId),
    index("workout_sessions_workout_day_id_idx").on(table.workoutDayId),
  ],
);

export const workoutSessionsRelations = relations(
  workoutSessions,
  ({ one, many }) => ({
    tenant: one(personals, {
      fields: [workoutSessions.tenantId],
      references: [personals.id],
    }),
    student: one(students, {
      fields: [workoutSessions.studentId],
      references: [students.id],
    }),
    workoutDay: one(workoutDays, {
      fields: [workoutSessions.workoutDayId],
      references: [workoutDays.id],
    }),
    exerciseExecutions: many(exerciseExecutions),
  }),
);

// Exercise Executions
export const exerciseExecutions = pgTable(
  "exercise_executions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    workoutSessionId: varchar("workout_session_id", { length: 36 })
      .notNull()
      .references(() => workoutSessions.id, { onDelete: "cascade" }),
    studentExerciseId: varchar("student_exercise_id", { length: 36 })
      .notNull()
      .references(() => studentExercises.id),
    exerciseId: varchar("exercise_id", { length: 36 })
      .notNull()
      .references(() => exercises.id),
    order: integer("order").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("exercise_executions_workout_session_id_idx").on(
      table.workoutSessionId,
    ),
  ],
);

export const exerciseExecutionsRelations = relations(
  exerciseExecutions,
  ({ one, many }) => ({
    workoutSession: one(workoutSessions, {
      fields: [exerciseExecutions.workoutSessionId],
      references: [workoutSessions.id],
    }),
    studentExercise: one(studentExercises, {
      fields: [exerciseExecutions.studentExerciseId],
      references: [studentExercises.id],
    }),
    exercise: one(exercises, {
      fields: [exerciseExecutions.exerciseId],
      references: [exercises.id],
    }),
    exerciseSets: many(exerciseSets),
  }),
);

// Exercise Sets
export const exerciseSets = pgTable(
  "exercise_sets",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    exerciseExecutionId: varchar("exercise_execution_id", { length: 36 })
      .notNull()
      .references(() => exerciseExecutions.id, { onDelete: "cascade" }),
    setNumber: integer("set_number").notNull(),
    plannedReps: integer("planned_reps"),
    performedReps: integer("performed_reps"),
    plannedWeight: numeric("planned_weight", { precision: 10, scale: 2 }),
    usedWeight: numeric("used_weight", { precision: 10, scale: 2 }),
    restSeconds: integer("rest_seconds"),
    completionStatus: varchar("completion_status", { length: 20 })
      .notNull()
      .$type<"completed" | "partial" | "skipped">(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("exercise_sets_exercise_execution_id_idx").on(
      table.exerciseExecutionId,
    ),
  ],
);

export const exerciseSetsRelations = relations(exerciseSets, ({ one }) => ({
  exerciseExecution: one(exerciseExecutions, {
    fields: [exerciseSets.exerciseExecutionId],
    references: [exerciseExecutions.id],
  }),
}));
