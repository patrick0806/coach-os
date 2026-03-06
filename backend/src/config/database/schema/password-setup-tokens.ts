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

export const passwordSetupTokens = pgTable(
  "password_setup_tokens",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // SHA-256 hex hash of the raw token — raw token is never persisted
    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("password_setup_tokens_hash_idx").on(table.tokenHash),
    index("password_setup_tokens_user_id_idx").on(table.userId),
  ]
);

export const passwordSetupTokensRelations = relations(
  passwordSetupTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [passwordSetupTokens.userId],
      references: [users.id],
    }),
  })
);

export type PasswordSetupToken = typeof passwordSetupTokens.$inferSelect;
export type NewPasswordSetupToken = typeof passwordSetupTokens.$inferInsert;
