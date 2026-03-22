import { randomUUID } from "crypto";
import {
  index,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    eventId: varchar("event_id", { length: 255 }).notNull().unique(),
    eventType: varchar("event_type", { length: 100 }).notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("webhook_events_event_id_idx").on(table.eventId),
  ],
);
