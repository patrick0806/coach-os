import { randomUUID } from "crypto";
import {
  boolean,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { plans } from "./plans";

export const coachInvitationTokens = pgTable(
  "coach_invitation_tokens",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    name: varchar("name", { length: 150 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    planId: varchar("plan_id", { length: 36 })
      .notNull()
      .references(() => plans.id),
    isWhitelisted: boolean("is_whitelisted").notNull().default(false),
    tokenHash: varchar("token_hash", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("coach_invitation_tokens_hash_idx").on(table.tokenHash),
    index("coach_invitation_tokens_email_idx").on(table.email),
  ],
);
