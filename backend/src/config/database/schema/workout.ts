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

export const exercises = pgTable(
  "exercises",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    name: varchar("name", { length: 150 }).notNull(),
    description: text("description"),
    muscleGroup: varchar("muscle_group", { length: 100 }).notNull(),
    personalId: varchar("personal_id", { length: 36 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
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
    personalId: varchar("personal_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 150 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
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
    workoutPlanId: varchar("workout_plan_id", { length: 36 }).notNull(),
    studentId: varchar("student_id", { length: 36 }).notNull(),
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
    workoutPlanId: varchar("workout_plan_id", { length: 36 }).notNull(),
    exerciseId: varchar("exercise_id", { length: 36 }).notNull(),
    sets: integer("sets").notNull(),
    repetitions: integer("repetitions").notNull(),
    load: varchar("load", { length: 50 }), // opcional, pode ser "20kg" ou "bodyweight"
    order: integer("order").default(0),
    notes: text("notes"),
  },
  (table) => [
    index("idx_workout_exercises_workout_plan_id").on(table.workoutPlanId),
    index("idx_workout_exercises_exercise_id").on(table.exerciseId),
  ]
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
