import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { personals } from "./personals";
import { users } from "./users";

export const students = pgTable(
  "students",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => personals.id),
    status: varchar("status", { length: 20 })
      .notNull()
      .default("active")
      .$type<"active" | "paused" | "archived">(),
    phoneNumber: varchar("phone_number", { length: 20 }),
    goal: varchar("goal", { length: 300 }),
    observations: text("observations"),
    physicalRestrictions: text("physical_restrictions"),
    currentStreak: integer("current_streak").default(0),
    lastWorkoutDate: timestamp("last_workout_date", { withTimezone: true }),
    totalWorkouts: integer("total_workouts").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("students_user_id_idx").on(table.userId),
    index("students_tenant_id_idx").on(table.tenantId),
  ],
);

export const studentsRelations = relations(students, ({ one }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  tenant: one(personals, {
    fields: [students.tenantId],
    references: [personals.id],
  }),
}));
