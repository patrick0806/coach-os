import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import {
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { personals } from "./personals";
import { students } from "./students";

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
  }),
);
