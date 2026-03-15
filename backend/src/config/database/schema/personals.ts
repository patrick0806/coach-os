import { randomUUID } from "crypto";
import { InferSelectModel, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { plans } from "./plans";
import { users } from "./users";

export const personals = pgTable(
  "personals",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 100 }).notNull(),
    bio: text("bio"),
    profilePhoto: varchar("profile_photo", { length: 500 }),
    themeColor: varchar("theme_color", { length: 7 }),
    phoneNumber: varchar("phone_number", { length: 20 }),
    lpTitle: varchar("lp_title", { length: 200 }),
    lpSubtitle: varchar("lp_subtitle", { length: 300 }),
    lpHeroImage: varchar("lp_hero_image", { length: 500 }),
    lpAboutTitle: varchar("lp_about_title", { length: 200 }),
    lpAboutText: text("lp_about_text"),
    lpImage1: varchar("lp_image_1", { length: 500 }),
    lpImage2: varchar("lp_image_2", { length: 500 }),
    lpImage3: varchar("lp_image_3", { length: 500 }),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
    subscriptionStatus: varchar("subscription_status", { length: 30 }),
    subscriptionPlanId: varchar("subscription_plan_id", { length: 36 }).references(
      () => plans.id,
    ),
    subscriptionExpiresAt: timestamp("subscription_expires_at", {
      withTimezone: true,
    }),
    trialStartedAt: timestamp("trial_started_at", { withTimezone: true }),
    trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
    accessStatus: varchar("access_status", { length: 20 })
      .notNull()
      .$type<"active" | "suspended" | "trialing" | "expired" | "past_due">(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("personals_user_id_idx").on(table.userId),
    uniqueIndex("personals_slug_idx").on(table.slug),
  ],
);

export const personalsRelations = relations(personals, ({ one }) => ({
  user: one(users, {
    fields: [personals.userId],
    references: [users.id],
  }),
  subscriptionPlan: one(plans, {
    fields: [personals.subscriptionPlanId],
    references: [plans.id],
  }),
}));

export type Personal = InferSelectModel<typeof personals>;
