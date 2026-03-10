import {
  pgTable,
  varchar,
  timestamp,
  index,
  uniqueIndex,
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

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
