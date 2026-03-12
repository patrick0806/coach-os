import {
  pgTable,
  varchar,
  timestamp,
  index,
  uniqueIndex,
  text,
  integer,
  date,
} from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { personals } from "./personals";

export const students = pgTable(
  "students",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: varchar("user_id", { length: 36 }).notNull().unique(),
    personalId: varchar("personal_id", { length: 36 }).notNull(),
    servicePlanId: varchar("service_plan_id", { length: 36 }).notNull(),
    // Gamification stats
    currentStreak: integer("current_streak").notNull().default(0),
    lastWorkoutDate: date("last_workout_date"),
    totalWorkouts: integer("total_workouts").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("students_user_id_idx").on(table.userId),
    index("students_personal_id_idx").on(table.personalId),
    index("students_service_plan_id_idx").on(table.servicePlanId),
  ]
);

export const studentsRelations = relations(students, ({ one }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  personal: one(personals, {
    fields: [students.personalId],
    references: [personals.id],
  }),
}));

export const studentNotes = pgTable(
  "student_notes",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    studentId: varchar("student_id", { length: 36 })
      .notNull()
      .references(() => students.id),
    personalId: varchar("personal_id", { length: 36 })
      .notNull()
      .references(() => personals.id),
    note: text("note").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("student_notes_student_created_at_idx").on(table.studentId, table.createdAt),
    index("student_notes_personal_id_idx").on(table.personalId),
  ],
);

export const studentNotesRelations = relations(studentNotes, ({ one }) => ({
  student: one(students, {
    fields: [studentNotes.studentId],
    references: [students.id],
  }),
  personal: one(personals, {
    fields: [studentNotes.personalId],
    references: [personals.id],
  }),
}));

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
export type StudentNote = typeof studentNotes.$inferSelect;
export type NewStudentNote = typeof studentNotes.$inferInsert;
