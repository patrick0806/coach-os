CREATE TABLE "schedule_rules" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"personal_id" varchar(36) NOT NULL,
	"student_id" varchar(36) NOT NULL,
	"day_of_week" integer NOT NULL,
	"workout_plan_id" varchar(36),
	"scheduled_time" varchar(5),
	"session_type" varchar(20) DEFAULT 'online' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_sessions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"personal_id" varchar(36) NOT NULL,
	"student_id" varchar(36) NOT NULL,
	"schedule_rule_id" varchar(36) NOT NULL,
	"workout_plan_id" varchar(36),
	"workout_session_id" varchar(36),
	"scheduled_date" date NOT NULL,
	"scheduled_time" varchar(5),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"session_type" varchar(20) DEFAULT 'online' NOT NULL,
	"cancelled_at" timestamp with time zone,
	"cancellation_reason" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "schedule_rules" ADD CONSTRAINT "schedule_rules_personal_id_personals_id_fk" FOREIGN KEY ("personal_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_rules" ADD CONSTRAINT "schedule_rules_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_rules" ADD CONSTRAINT "schedule_rules_workout_plan_id_workout_plans_id_fk" FOREIGN KEY ("workout_plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_personal_id_personals_id_fk" FOREIGN KEY ("personal_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_schedule_rule_id_schedule_rules_id_fk" FOREIGN KEY ("schedule_rule_id") REFERENCES "public"."schedule_rules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_workout_plan_id_workout_plans_id_fk" FOREIGN KEY ("workout_plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_workout_session_id_workout_sessions_id_fk" FOREIGN KEY ("workout_session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_schedule_rules_personal_id" ON "schedule_rules" USING btree ("personal_id");--> statement-breakpoint
CREATE INDEX "idx_schedule_rules_student_id" ON "schedule_rules" USING btree ("student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_schedule_rule_student_day" ON "schedule_rules" USING btree ("student_id","day_of_week");--> statement-breakpoint
CREATE INDEX "idx_training_sessions_personal_id" ON "training_sessions" USING btree ("personal_id");--> statement-breakpoint
CREATE INDEX "idx_training_sessions_student_id" ON "training_sessions" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_training_sessions_scheduled_date" ON "training_sessions" USING btree ("scheduled_date");--> statement-breakpoint
CREATE INDEX "idx_training_sessions_status" ON "training_sessions" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_training_session_student_date_rule" ON "training_sessions" USING btree ("student_id","scheduled_date","schedule_rule_id");
