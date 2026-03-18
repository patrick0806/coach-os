import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import {
  date,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { personals } from "./personals";
import { students } from "./students";

// Progress Checkins
export const progressCheckins = pgTable(
  "progress_checkins",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => personals.id),
    studentId: varchar("student_id", { length: 36 })
      .notNull()
      .references(() => students.id),
    checkinDate: date("checkin_date").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("progress_checkins_tenant_id_idx").on(t.tenantId),
    index("progress_checkins_student_id_idx").on(t.studentId),
  ],
);

export const progressCheckinsRelations = relations(
  progressCheckins,
  ({ one, many }) => ({
    tenant: one(personals, {
      fields: [progressCheckins.tenantId],
      references: [personals.id],
    }),
    student: one(students, {
      fields: [progressCheckins.studentId],
      references: [students.id],
    }),
    records: many(progressRecords),
    photos: many(progressPhotos),
  }),
);

// Progress Records
export const progressRecords = pgTable(
  "progress_records",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => personals.id),
    studentId: varchar("student_id", { length: 36 })
      .notNull()
      .references(() => students.id),
    checkinId: varchar("checkin_id", { length: 36 }).references(
      () => progressCheckins.id,
      { onDelete: "cascade" },
    ),
    metricType: varchar("metric_type", { length: 50 }).notNull(),
    value: numeric("value", { precision: 10, scale: 2 }).notNull(),
    unit: varchar("unit", { length: 20 }).notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("progress_records_tenant_id_idx").on(table.tenantId),
    index("progress_records_student_id_idx").on(table.studentId),
  ],
);

export const progressRecordsRelations = relations(
  progressRecords,
  ({ one }) => ({
    tenant: one(personals, {
      fields: [progressRecords.tenantId],
      references: [personals.id],
    }),
    student: one(students, {
      fields: [progressRecords.studentId],
      references: [students.id],
    }),
    checkin: one(progressCheckins, {
      fields: [progressRecords.checkinId],
      references: [progressCheckins.id],
    }),
  }),
);

// Progress Photos
export const progressPhotos = pgTable(
  "progress_photos",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => personals.id),
    studentId: varchar("student_id", { length: 36 })
      .notNull()
      .references(() => students.id),
    checkinId: varchar("checkin_id", { length: 36 }).references(
      () => progressCheckins.id,
      { onDelete: "cascade" },
    ),
    mediaUrl: varchar("media_url", { length: 500 }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("progress_photos_tenant_id_idx").on(table.tenantId),
    index("progress_photos_student_id_idx").on(table.studentId),
  ],
);

export const progressPhotosRelations = relations(
  progressPhotos,
  ({ one }) => ({
    tenant: one(personals, {
      fields: [progressPhotos.tenantId],
      references: [personals.id],
    }),
    student: one(students, {
      fields: [progressPhotos.studentId],
      references: [students.id],
    }),
    checkin: one(progressCheckins, {
      fields: [progressPhotos.checkinId],
      references: [progressCheckins.id],
    }),
  }),
);
