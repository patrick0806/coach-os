CREATE TABLE "workout_sessions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"student_id" varchar(36) NOT NULL,
	"workout_plan_id" varchar(36) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"current_step" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_workout_plan_id_workout_plans_id_fk" FOREIGN KEY ("workout_plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_workout_sessions_student_id" ON "workout_sessions" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_workout_sessions_plan_id" ON "workout_sessions" USING btree ("workout_plan_id");--> statement-breakpoint
CREATE INDEX "idx_workout_sessions_status" ON "workout_sessions" USING btree ("status");