import {
  pgTable,
  varchar,
  timestamp,
  index,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";
import { personals } from "./personals";
import { relations } from "drizzle-orm";

export const students = pgTable(
  "students",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    name: varchar("name", { length: 150 }).notNull(),
    email: varchar("email", { length: 150 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    isActive: boolean("is_active").default(true),
    personalId: varchar("personal_id", { length: 36 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("students_personal_id_idx").on(table.personalId),
    uniqueIndex("students_email_personal_idx").on(
      table.email,
      table.personalId
    ),
  ]
);

export const studentsRelations = relations(students, ({ one }) => ({
  personal: one(personals, {
    fields: [students.personalId],
    references: [personals.id],
  }),
}));

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
