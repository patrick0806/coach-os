import {
  pgTable,
  varchar,
  timestamp,
  text,
  integer,
  index,
  uniqueIndex,
  AnyPgColumn,
} from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import { personals } from "./personals";
import { students } from "./students";

export const exercises = pgTable(
  "exercises",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    name: varchar("name", { length: 150 }).notNull(),
    description: text("description"),
    muscleGroup: varchar("muscle_group", { length: 100 }).notNull(),
    exercisedbGifUrl: text("exercisedb_gif_url"),
    youtubeUrl: text("youtube_url"),
    // null = global exercise (available to all); set = personal's custom exercise
    personalId: varchar("personal_id", { length: 36 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_exercises_personal_id").on(table.personalId),
    index("idx_exercises_muscle_group").on(table.muscleGroup),
  ]
);

export const workoutPlans = pgTable(
  "workout_plans",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    personalId: varchar("personal_id", { length: 36 })
      .notNull()
      .references(() => personals.id),
    name: varchar("name", { length: 150 }).notNull(),
    description: text("description"),
    planKind: varchar("plan_kind", { length: 10 })
      .$type<"template" | "student">()
      .notNull()
      .default("template"),
    sourceTemplateId: varchar("source_template_id", { length: 36 }).references(
      (): AnyPgColumn => workoutPlans.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_workout_plans_personal_id").on(table.personalId),
    index("idx_workout_plans_personal_kind").on(table.personalId, table.planKind),
  ]
);

export const workoutPlanStudents = pgTable(
  "workout_plan_students",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    workoutPlanId: varchar("workout_plan_id", { length: 36 })
      .notNull()
      .references(() => workoutPlans.id, { onDelete: "cascade" }),
    studentId: varchar("student_id", { length: 36 })
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("uniq_workout_plan_student").on(
      table.workoutPlanId,
      table.studentId
    ),
    index("idx_workout_plan_students_student_id").on(table.studentId),
  ]
);

export const workoutExercises = pgTable(
  "workout_exercises",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    workoutPlanId: varchar("workout_plan_id", { length: 36 })
      .notNull()
      .references(() => workoutPlans.id, { onDelete: "cascade" }),
    exerciseId: varchar("exercise_id", { length: 36 })
      .notNull()
      .references(() => exercises.id),
    sets: integer("sets").notNull(),
    repetitions: integer("repetitions").notNull(),
    load: varchar("load", { length: 50 }),
    restTime: varchar("rest_time", { length: 50 }),
    executionTime: varchar("execution_time", { length: 50 }),
    order: integer("order").notNull().default(0),
    notes: text("notes"),
  },
  (table) => [
    index("idx_workout_exercises_workout_plan_id").on(table.workoutPlanId),
    index("idx_workout_exercises_exercise_id").on(table.exerciseId),
  ]
);

export const workoutPlansRelations = relations(
  workoutPlans,
  ({ one, many }) => ({
    personal: one(personals, {
      fields: [workoutPlans.personalId],
      references: [personals.id],
    }),
    exercises: many(workoutExercises),
    students: many(workoutPlanStudents),
  })
);

export const workoutExercisesRelations = relations(
  workoutExercises,
  ({ one }) => ({
    workoutPlan: one(workoutPlans, {
      fields: [workoutExercises.workoutPlanId],
      references: [workoutPlans.id],
    }),
    exercise: one(exercises, {
      fields: [workoutExercises.exerciseId],
      references: [exercises.id],
    }),
  })
);

export const workoutPlanStudentsRelations = relations(
  workoutPlanStudents,
  ({ one }) => ({
    workoutPlan: one(workoutPlans, {
      fields: [workoutPlanStudents.workoutPlanId],
      references: [workoutPlans.id],
    }),
    student: one(students, {
      fields: [workoutPlanStudents.studentId],
      references: [students.id],
    }),
  })
);

// Workout Sessions — tracks execution of workout plans by students
export const workoutSessions = pgTable(
  "workout_sessions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    studentId: varchar("student_id", { length: 36 })
      .notNull()
      .references(() => students.id),
    workoutPlanId: varchar("workout_plan_id", { length: 36 })
      .notNull()
      .references(() => workoutPlans.id),
    // Status: "active" | "completed"
    status: varchar("status", { length: 20 }).notNull().default("active"),
    currentStep: integer("current_step").notNull().default(0),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_workout_sessions_student_id").on(table.studentId),
    index("idx_workout_sessions_plan_id").on(table.workoutPlanId),
    index("idx_workout_sessions_status").on(table.status),
  ]
);

export const workoutSessionsRelations = relations(workoutSessions, ({ one }) => ({
  student: one(students, {
    fields: [workoutSessions.studentId],
    references: [students.id],
  }),
  workoutPlan: one(workoutPlans, {
    fields: [workoutSessions.workoutPlanId],
    references: [workoutPlans.id],
  }),
}));

// Types
export type Exercise = typeof exercises.$inferSelect;
export type CreateExercise = typeof exercises.$inferInsert;

export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type CreateWorkoutPlan = typeof workoutPlans.$inferInsert;

export type WorkoutPlanStudent = typeof workoutPlanStudents.$inferSelect;
export type CreateWorkoutPlanStudent = typeof workoutPlanStudents.$inferInsert;

export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type CreateWorkoutExercise = typeof workoutExercises.$inferInsert;

export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type CreateWorkoutSession = typeof workoutSessions.$inferInsert;
