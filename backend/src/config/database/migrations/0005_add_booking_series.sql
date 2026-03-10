CREATE TABLE "booking_series" (
  "id" varchar(36) PRIMARY KEY NOT NULL,
  "personal_id" varchar(36) NOT NULL,
  "student_id" varchar(36) NOT NULL,
  "service_plan_id" varchar(36) NOT NULL,
  "days_of_week" integer[] NOT NULL,
  "start_time" varchar(5) NOT NULL,
  "end_time" varchar(5) NOT NULL,
  "series_start_date" date NOT NULL,
  "series_end_date" date NOT NULL,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "booking_series" ADD CONSTRAINT "booking_series_personal_id_personals_id_fk" FOREIGN KEY ("personal_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_series" ADD CONSTRAINT "booking_series_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_series" ADD CONSTRAINT "booking_series_service_plan_id_service_plans_id_fk" FOREIGN KEY ("service_plan_id") REFERENCES "public"."service_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "bookings" ADD COLUMN "series_id" varchar(36);--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_series_id_booking_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."booking_series"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint

CREATE INDEX "idx_booking_series_personal_id" ON "booking_series" USING btree ("personal_id");--> statement-breakpoint
CREATE INDEX "idx_booking_series_start_date" ON "booking_series" USING btree ("series_start_date");--> statement-breakpoint
CREATE INDEX "idx_bookings_series_id" ON "bookings" USING btree ("series_id");
