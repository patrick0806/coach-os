import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  json,
  numeric,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { personals } from "./personals";

export const plans = pgTable("plans", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  highlighted: boolean("highlighted").default(false),
  order: integer("order").default(0),
  benefits: json("benefits").$type<string[]>(),
  maxStudents: integer("max_students").notNull(),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const plansRelations = relations(plans, ({ many }) => ({
  personals: many(personals),
}));
