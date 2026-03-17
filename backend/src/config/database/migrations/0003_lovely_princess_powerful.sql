CREATE TABLE "training_schedules" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"student_id" varchar(36) NOT NULL,
	"student_program_id" varchar(36),
	"day_of_week" integer NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"location" varchar(300),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "training_schedules" ADD CONSTRAINT "training_schedules_tenant_id_personals_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_schedules" ADD CONSTRAINT "training_schedules_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_schedules" ADD CONSTRAINT "training_schedules_student_program_id_student_programs_id_fk" FOREIGN KEY ("student_program_id") REFERENCES "public"."student_programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "training_schedules_tenant_id_idx" ON "training_schedules" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "training_schedules_student_id_idx" ON "training_schedules" USING btree ("student_id");