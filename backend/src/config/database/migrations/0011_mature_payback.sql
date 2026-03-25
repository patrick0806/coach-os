CREATE TABLE "calendar_events" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"student_id" varchar(36),
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"type" varchar(20) NOT NULL,
	"recurring_slot_id" varchar(36),
	"original_start_at" timestamp with time zone,
	"status" varchar(20) NOT NULL,
	"appointment_type" varchar(20),
	"meeting_url" varchar(500),
	"location" varchar(300),
	"notes" text,
	"cancelled_at" timestamp with time zone,
	"cancellation_reason" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recurring_slots" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"student_id" varchar(36),
	"student_program_id" varchar(36),
	"type" varchar(20) NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"location" varchar(300),
	"effective_from" date NOT NULL,
	"effective_to" date,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "working_hours" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"effective_from" date NOT NULL,
	"effective_to" date,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_tenant_id_personals_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_recurring_slot_id_recurring_slots_id_fk" FOREIGN KEY ("recurring_slot_id") REFERENCES "public"."recurring_slots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_slots" ADD CONSTRAINT "recurring_slots_tenant_id_personals_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_slots" ADD CONSTRAINT "recurring_slots_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_slots" ADD CONSTRAINT "recurring_slots_student_program_id_student_programs_id_fk" FOREIGN KEY ("student_program_id") REFERENCES "public"."student_programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "working_hours" ADD CONSTRAINT "working_hours_tenant_id_personals_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "calendar_events_tenant_id_start_at_idx" ON "calendar_events" USING btree ("tenant_id","start_at");--> statement-breakpoint
CREATE INDEX "calendar_events_tenant_id_recurring_slot_id_idx" ON "calendar_events" USING btree ("tenant_id","recurring_slot_id");--> statement-breakpoint
CREATE INDEX "calendar_events_tenant_id_student_id_start_at_idx" ON "calendar_events" USING btree ("tenant_id","student_id","start_at");--> statement-breakpoint
CREATE INDEX "calendar_events_tenant_id_status_start_at_idx" ON "calendar_events" USING btree ("tenant_id","status","start_at");--> statement-breakpoint
CREATE INDEX "recurring_slots_tenant_id_active_idx" ON "recurring_slots" USING btree ("tenant_id","is_active");--> statement-breakpoint
CREATE INDEX "recurring_slots_tenant_id_student_id_idx" ON "recurring_slots" USING btree ("tenant_id","student_id");--> statement-breakpoint
CREATE INDEX "recurring_slots_tenant_id_day_of_week_idx" ON "recurring_slots" USING btree ("tenant_id","day_of_week");--> statement-breakpoint
CREATE INDEX "working_hours_tenant_id_active_idx" ON "working_hours" USING btree ("tenant_id","is_active");