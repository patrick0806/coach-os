import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { exercises } from "./exercises";
import { personals } from "./personals";
import { students } from "./students";

// Program Templates
export const programTemplates = pgTable(
  "program_templates",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => personals.id),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 20 })
      .notNull()
      .$type<"active" | "archived">()
      .default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("program_templates_tenant_id_idx").on(table.tenantId),
  ],
);

export const programTemplatesRelations = relations(
  programTemplates,
  ({ one, many }) => ({
    tenant: one(personals, {
      fields: [programTemplates.tenantId],
      references: [personals.id],
    }),
    workoutTemplates: many(workoutTemplates),
    studentPrograms: many(studentPrograms),
  }),
);

// Workout Templates
export const workoutTemplates = pgTable(
  "workout_templates",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    programTemplateId: varchar("program_template_id", { length: 36 })
      .notNull()
      .references(() => programTemplates.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    order: integer("order").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("workout_templates_program_template_id_idx").on(
      table.programTemplateId,
    ),
  ],
);

export const workoutTemplatesRelations = relations(
  workoutTemplates,
  ({ one, many }) => ({
    programTemplate: one(programTemplates, {
      fields: [workoutTemplates.programTemplateId],
      references: [programTemplates.id],
    }),
    exerciseTemplates: many(exerciseTemplates),
  }),
);

// Exercise Templates
export const exerciseTemplates = pgTable(
  "exercise_templates",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    workoutTemplateId: varchar("workout_template_id", { length: 36 })
      .notNull()
      .references(() => workoutTemplates.id, { onDelete: "cascade" }),
    exerciseId: varchar("exercise_id", { length: 36 })
      .notNull()
      .references(() => exercises.id),
    sets: integer("sets").notNull(),
    repetitions: integer("repetitions"),
    restSeconds: integer("rest_seconds"),
    duration: varchar("duration", { length: 50 }),
    order: integer("order").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("exercise_templates_workout_template_id_idx").on(
      table.workoutTemplateId,
    ),
  ],
);

export const exerciseTemplatesRelations = relations(
  exerciseTemplates,
  ({ one }) => ({
    workoutTemplate: one(workoutTemplates, {
      fields: [exerciseTemplates.workoutTemplateId],
      references: [workoutTemplates.id],
    }),
    exercise: one(exercises, {
      fields: [exerciseTemplates.exerciseId],
      references: [exercises.id],
    }),
  }),
);

// Student Programs
export const studentPrograms = pgTable(
  "student_programs",
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
    programTemplateId: varchar("program_template_id", {
      length: 36,
    }).references(() => programTemplates.id, { onDelete: "set null" }),
    name: varchar("name", { length: 200 }).notNull(),
    status: varchar("status", { length: 20 })
      .notNull()
      .$type<"active" | "finished" | "cancelled">()
      .default("active"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("student_programs_tenant_id_idx").on(table.tenantId),
    index("student_programs_student_id_idx").on(table.studentId),
  ],
);

export const studentProgramsRelations = relations(
  studentPrograms,
  ({ one, many }) => ({
    tenant: one(personals, {
      fields: [studentPrograms.tenantId],
      references: [personals.id],
    }),
    student: one(students, {
      fields: [studentPrograms.studentId],
      references: [students.id],
    }),
    programTemplate: one(programTemplates, {
      fields: [studentPrograms.programTemplateId],
      references: [programTemplates.id],
    }),
    workoutDays: many(workoutDays),
  }),
);

// Workout Days
export const workoutDays = pgTable(
  "workout_days",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    studentProgramId: varchar("student_program_id", { length: 36 })
      .notNull()
      .references(() => studentPrograms.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    order: integer("order").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("workout_days_student_program_id_idx").on(table.studentProgramId),
  ],
);

export const workoutDaysRelations = relations(
  workoutDays,
  ({ one, many }) => ({
    studentProgram: one(studentPrograms, {
      fields: [workoutDays.studentProgramId],
      references: [studentPrograms.id],
    }),
    studentExercises: many(studentExercises),
  }),
);

// Student Exercises
export const studentExercises = pgTable(
  "student_exercises",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    workoutDayId: varchar("workout_day_id", { length: 36 })
      .notNull()
      .references(() => workoutDays.id, { onDelete: "cascade" }),
    exerciseId: varchar("exercise_id", { length: 36 })
      .notNull()
      .references(() => exercises.id),
    sets: integer("sets").notNull(),
    repetitions: integer("repetitions"),
    plannedWeight: numeric("planned_weight", { precision: 10, scale: 2 }),
    restSeconds: integer("rest_seconds"),
    duration: varchar("duration", { length: 50 }),
    order: integer("order").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("student_exercises_workout_day_id_idx").on(table.workoutDayId),
  ],
);

export const studentExercisesRelations = relations(
  studentExercises,
  ({ one }) => ({
    workoutDay: one(workoutDays, {
      fields: [studentExercises.workoutDayId],
      references: [workoutDays.id],
    }),
    exercise: one(exercises, {
      fields: [studentExercises.exerciseId],
      references: [exercises.id],
    }),
  }),
);
