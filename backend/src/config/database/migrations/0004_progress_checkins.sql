CREATE TABLE "progress_checkins" (
  "id" varchar(36) PRIMARY KEY NOT NULL,
  "tenant_id" varchar(36) NOT NULL REFERENCES "personals"("id"),
  "student_id" varchar(36) NOT NULL REFERENCES "students"("id"),
  "checkin_date" date NOT NULL,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);

CREATE INDEX "progress_checkins_tenant_id_idx" ON "progress_checkins" ("tenant_id");
CREATE INDEX "progress_checkins_student_id_idx" ON "progress_checkins" ("student_id");

ALTER TABLE "progress_records" ADD COLUMN "checkin_id" varchar(36)
  REFERENCES "progress_checkins"("id") ON DELETE CASCADE;

ALTER TABLE "progress_photos" ADD COLUMN "checkin_id" varchar(36)
  REFERENCES "progress_checkins"("id") ON DELETE CASCADE;
