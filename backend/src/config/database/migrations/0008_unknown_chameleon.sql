CREATE TABLE "training_schedule_exceptions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"training_schedule_id" varchar(36) NOT NULL,
	"original_date" date NOT NULL,
	"action" varchar(20) NOT NULL,
	"new_date" date,
	"new_start_time" varchar(5),
	"new_end_time" varchar(5),
	"new_location" varchar(300),
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "training_schedule_exceptions" ADD CONSTRAINT "training_schedule_exceptions_tenant_id_personals_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_schedule_exceptions" ADD CONSTRAINT "training_schedule_exceptions_training_schedule_id_training_schedules_id_fk" FOREIGN KEY ("training_schedule_id") REFERENCES "public"."training_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "training_schedule_exceptions_tenant_id_idx" ON "training_schedule_exceptions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "training_schedule_exceptions_schedule_id_idx" ON "training_schedule_exceptions" USING btree ("training_schedule_id");--> statement-breakpoint
CREATE INDEX "training_schedule_exceptions_original_date_idx" ON "training_schedule_exceptions" USING btree ("original_date");