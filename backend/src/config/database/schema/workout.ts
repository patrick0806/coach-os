import {
  pgTable,
  varchar,
  timestamp,
  text,
  integer,
  index,
  uniqueIndex,
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
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("idx_workout_plans_personal_id").on(table.personalId)]
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

// Types
export type Exercise = typeof exercises.$inferSelect;
export type CreateExercise = typeof exercises.$inferInsert;

export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type CreateWorkoutPlan = typeof workoutPlans.$inferInsert;

export type WorkoutPlanStudent = typeof workoutPlanStudents.$inferSelect;
export type CreateWorkoutPlanStudent = typeof workoutPlanStudents.$inferInsert;

export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type CreateWorkoutExercise = typeof workoutExercises.$inferInsert;
