import {
  boolean,
  integer,
  json,
  numeric,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { randomUUID } from "node:crypto";

export const plans = pgTable("plans", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: varchar("name", { length: 150 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  price: numeric({ precision: 10, scale: 2 }).notNull(),
  highlighted: boolean("highlighted").notNull().default(false),
  order: integer("order").notNull().default(0),
  benefits: json("benefits").$type<string[]>().notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Plans = typeof plans.$inferSelect;
export type CreatePlan = typeof plans.$inferInsert;
