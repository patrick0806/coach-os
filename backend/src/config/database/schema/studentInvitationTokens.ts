import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { personals } from "./personals";

export const studentInvitationTokens = pgTable(
  "student_invitation_tokens",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => personals.id),
    email: varchar("email", { length: 255 }).notNull(),
    tokenHash: varchar("token_hash", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("student_invitation_tokens_hash_idx").on(table.tokenHash),
    index("student_invitation_tokens_tenant_id_idx").on(table.tenantId),
    index("student_invitation_tokens_email_idx").on(table.email),
  ],
);

export const studentInvitationTokensRelations = relations(
  studentInvitationTokens,
  ({ one }) => ({
    tenant: one(personals, {
      fields: [studentInvitationTokens.tenantId],
      references: [personals.id],
    }),
  }),
);
