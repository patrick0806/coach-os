CREATE TABLE "availability_slots" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"personal_id" varchar(36) NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"personal_id" varchar(36) NOT NULL,
	"student_id" varchar(36) NOT NULL,
	"service_plan_id" varchar(36) NOT NULL,
	"scheduled_date" timestamp with time zone NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"notes" text,
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"cancelled_at" timestamp with time zone,
	"cancellation_reason" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_plans" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"personal_id" varchar(36) NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"sessions_per_week" integer NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "idx_availability_slots_personal_id" ON "availability_slots" USING btree ("personal_id");--> statement-breakpoint
CREATE INDEX "idx_availability_slots_day" ON "availability_slots" USING btree ("day_of_week");--> statement-breakpoint
CREATE INDEX "idx_bookings_personal_id" ON "bookings" USING btree ("personal_id");--> statement-breakpoint
CREATE INDEX "idx_bookings_student_id" ON "bookings" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_bookings_date" ON "bookings" USING btree ("scheduled_date");--> statement-breakpoint
CREATE INDEX "idx_bookings_status" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_booking_time" ON "bookings" USING btree ("personal_id","scheduled_date","start_time");--> statement-breakpoint
CREATE INDEX "idx_service_plans_personal_id" ON "service_plans" USING btree ("personal_id");