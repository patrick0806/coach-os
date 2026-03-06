import {
  pgTable,
  varchar,
  timestamp,
  index,
  uniqueIndex,
  text,
} from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { students } from "./students";

export const personals = pgTable(
  "personals",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: varchar("user_id", { length: 36 }).notNull().unique(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    bio: text("bio"),
    profilePhoto: varchar("profile_photo", { length: 500 }),
    themeColor: varchar("theme_color", { length: 7 })
      .notNull()
      .default("#10b981"),
    phoneNumber: varchar("phone_number", { length: 20 }),
    lpTitle: varchar("lp_title", { length: 255 }),
    lpSubtitle: varchar("lp_subtitle", { length: 255 }),
    lpHeroImage: varchar("lp_hero_image", { length: 500 }),
    lpAboutTitle: varchar("lp_about_title", { length: 255 }),
    lpAboutText: text("lp_about_text"),
    lpImage1: varchar("lp_image1", { length: 500 }),
    lpImage2: varchar("lp_image2", { length: 500 }),
    lpImage3: varchar("lp_image3", { length: 500 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("personals_slug_idx").on(table.slug),
    uniqueIndex("personals_user_id_idx").on(table.userId),
    index("personals_created_at_idx").on(table.createdAt),
  ]
);

export const personalsRelations = relations(personals, ({ one, many }) => ({
  user: one(users, {
    fields: [personals.userId],
    references: [users.id],
  }),
  students: many(students),
}));

export type Personal = typeof personals.$inferSelect;
export type NewPersonal = typeof personals.$inferInsert;
