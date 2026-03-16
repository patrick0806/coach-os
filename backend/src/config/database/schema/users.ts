import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { admins } from "./admins";
import { passwordResetTokens, passwordSetupTokens } from "./passwordTokens";
import { personals } from "./personals";
import { students } from "./students";

export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    name: varchar("name", { length: 150 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    isActive: boolean("is_active").default(true),
    role: varchar("role", { length: 20 })
      .notNull()
      .$type<"ADMIN" | "PERSONAL" | "STUDENT">(),
    refreshTokenHash: varchar("refresh_token_hash", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
    index("users_role_idx").on(table.role),
    index("users_created_at_idx").on(table.createdAt),
  ],
);

export const usersRelations = relations(users, ({ one, many }) => ({
  admin: one(admins, {
    fields: [users.id],
    references: [admins.userId],
  }),
  personal: one(personals, {
    fields: [users.id],
    references: [personals.userId],
  }),
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  passwordSetupTokens: many(passwordSetupTokens),
  passwordResetTokens: many(passwordResetTokens),
}));
