import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { personals } from "./personals";

export const exercises = pgTable(
  "exercises",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    muscleGroup: varchar("muscle_group", { length: 100 }).notNull(),
    instructions: text("instructions"),
    mediaUrl: varchar("media_url", { length: 500 }),
    youtubeUrl: varchar("youtube_url", { length: 500 }),
    tenantId: varchar("tenant_id", { length: 36 }).references(
      () => personals.id,
    ),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("exercises_tenant_id_idx").on(table.tenantId),
    index("exercises_muscle_group_idx").on(table.muscleGroup),
  ],
);

export const exercisesRelations = relations(exercises, ({ one }) => ({
  tenant: one(personals, {
    fields: [exercises.tenantId],
    references: [personals.id],
  }),
}));
