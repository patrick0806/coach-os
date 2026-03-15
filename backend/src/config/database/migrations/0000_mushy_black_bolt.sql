CREATE TABLE "plans" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"highlighted" boolean DEFAULT false,
	"order" integer DEFAULT 0,
	"benefits" json,
	"max_students" integer NOT NULL,
	"stripe_price_id" varchar(255),
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true,
	"role" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admins" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "personals" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"bio" text,
	"profile_photo" varchar(500),
	"theme_color" varchar(7),
	"phone_number" varchar(20),
	"lp_title" varchar(200),
	"lp_subtitle" varchar(300),
	"lp_hero_image" varchar(500),
	"lp_about_title" varchar(200),
	"lp_about_text" text,
	"lp_image_1" varchar(500),
	"lp_image_2" varchar(500),
	"lp_image_3" varchar(500),
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"subscription_status" varchar(30),
	"subscription_plan_id" varchar(36),
	"subscription_expires_at" timestamp with time zone,
	"trial_started_at" timestamp with time zone,
	"trial_ends_at" timestamp with time zone,
	"access_status" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "password_setup_tokens" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"current_streak" integer DEFAULT 0,
	"last_workout_date" timestamp with time zone,
	"total_workouts" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"muscle_group" varchar(100) NOT NULL,
	"instructions" text,
	"media_url" varchar(500),
	"youtube_url" varchar(500),
	"tenant_id" varchar(36),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coach_student_relations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"student_id" varchar(36) NOT NULL,
	"status" varchar(20) NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coaching_contracts" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"student_id" varchar(36) NOT NULL,
	"service_plan_id" varchar(36) NOT NULL,
	"status" varchar(20) NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_plans" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"sessions_per_week" integer,
	"duration_minutes" integer,
	"price" numeric(10, 2) NOT NULL,
	"attendance_type" varchar(20) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "student_notes" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"student_id" varchar(36) NOT NULL,
	"note" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "exercise_templates" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"workout_template_id" varchar(36) NOT NULL,
	"exercise_id" varchar(36) NOT NULL,
	"sets" integer NOT NULL,
	"repetitions" integer,
	"rest_seconds" integer,
	"duration" varchar(50),
	"order" integer NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "program_templates" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "student_exercises" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"workout_day_id" varchar(36) NOT NULL,
	"exercise_id" varchar(36) NOT NULL,
	"sets" integer NOT NULL,
	"repetitions" integer,
	"planned_weight" numeric(10, 2),
	"rest_seconds" integer,
	"duration" varchar(50),
	"order" integer NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "student_programs" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"student_id" varchar(36) NOT NULL,
	"program_template_id" varchar(36),
	"name" varchar(200) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workout_days" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"student_program_id" varchar(36) NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workout_templates" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"program_template_id" varchar(36) NOT NULL,
	"name" varchar(200) NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "exercise_executions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"workout_session_id" varchar(36) NOT NULL,
	"student_exercise_id" varchar(36) NOT NULL,
	"exercise_id" varchar(36) NOT NULL,
	"order" integer NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "exercise_sets" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"exercise_execution_id" varchar(36) NOT NULL,
	"set_number" integer NOT NULL,
	"planned_reps" integer,
	"performed_reps" integer,
	"planned_weight" numeric(10, 2),
	"used_weight" numeric(10, 2),
	"rest_seconds" integer,
	"completion_status" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workout_sessions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"student_id" varchar(36) NOT NULL,
	"workout_day_id" varchar(36) NOT NULL,
	"status" varchar(20) NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "progress_photos" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"student_id" varchar(36) NOT NULL,
	"media_url" varchar(500) NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "progress_records" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"student_id" varchar(36) NOT NULL,
	"metric_type" varchar(50) NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"unit" varchar(20) NOT NULL,
	"recorded_at" timestamp with time zone NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "appointment_requests" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"student_id" varchar(36) NOT NULL,
	"requested_date" timestamp with time zone NOT NULL,
	"requested_start_time" varchar(5) NOT NULL,
	"requested_end_time" varchar(5) NOT NULL,
	"status" varchar(20) NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"student_id" varchar(36) NOT NULL,
	"appointment_request_id" varchar(36),
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"appointment_type" varchar(20) NOT NULL,
	"status" varchar(20) NOT NULL,
	"meeting_url" varchar(500),
	"location" varchar(300),
	"notes" text,
	"cancelled_at" timestamp with time zone,
	"cancellation_reason" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "availability_exceptions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"exception_date" date NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "availability_rules" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personals" ADD CONSTRAINT "personals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personals" ADD CONSTRAINT "personals_subscription_plan_id_plans_id_fk" FOREIGN KEY ("subscription_plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_setup_tokens" ADD CONSTRAINT "password_setup_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_tenant_id_personals_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_tenant_id_personals_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_student_relations" ADD CONSTRAINT "coach_student_relations_tenant_id_personals_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_student_relations" ADD CONSTRAINT "coach_student_relations_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching_contracts" ADD CONSTRAINT "coaching_contracts_tenant_id_personals_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching_contracts" ADD CONSTRAINT "coaching_contracts_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching_contracts" ADD CONSTRAINT "coaching_contracts_service_plan_id_service_plans_id_fk" FOREIGN KEY ("service_plan_id") REFERENCES "public"."service_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_plans" ADD CONSTRAINT "service_plans_tenant_id_personals_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_notes" ADD CONSTRAINT "student_notes_tenant_id_personals_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_notes" ADD CONSTRAINT "student_notes_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_templates" ADD CONSTRAINT "exercise_templates_workout_template_id_workout_templates_id_fk" FOREIGN KEY ("workout_template_id") REFERENCES "public"."workout_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_templates" ADD CONSTRAINT "exercise_templates_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_templates" ADD CONSTRAINT "program_templates_tenant_id_personals_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_exercises" ADD CONSTRAINT "student_exercises_workout_day_id_workout_days_id_fk" FOREIGN KEY ("workout_day_id") REFERENCES "public"."workout_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_exercises" ADD CONSTRAINT "student_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_programs" ADD CONSTRAINT "student_programs_tenant_id_personals_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_programs" ADD CONSTRAINT "student_programs_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_programs" ADD CONSTRAINT "student_programs_program_template_id_program_templates_id_fk" FOREIGN KEY ("program_template_id") REFERENCES "public"."program_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_days" ADD CONSTRAINT "workout_days_student_program_id_student_programs_id_fk" FOREIGN KEY ("student_program_id") REFERENCES "public"."student_programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_templates" ADD CONSTRAINT "workout_templates_program_template_id_program_templates_id_fk" FOREIGN KEY ("program_template_id") REFERENCES "public"."program_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_executions" ADD CONSTRAINT "exercise_executions_workout_session_id_workout_sessions_id_fk" FOREIGN KEY ("workout_session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_executions" ADD CONSTRAINT "exercise_executions_student_exercise_id_student_exercises_id_fk" FOREIGN KEY ("student_exercise_id") REFERENCES "public"."student_exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_executions" ADD CONSTRAINT "exercise_executions_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_sets" ADD CONSTRAINT "exercise_sets_exercise_execution_id_exercise_executions_id_fk" FOREIGN KEY ("exercise_execution_id") REFERENCES "public"."exercise_executions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_tenant_id_personals_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_workout_day_id_workout_days_id_fk" FOREIGN KEY ("workout_day_id") REFERENCES "public"."workout_days"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_photos" ADD CONSTRAINT "progress_photos_tenant_id_personals_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_photos" ADD CONSTRAINT "progress_photos_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_records" ADD CONSTRAINT "progress_records_tenant_id_personals_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_records" ADD CONSTRAINT "progress_records_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_requests" ADD CONSTRAINT "appointment_requests_tenant_id_personals_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_requests" ADD CONSTRAINT "appointment_requests_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_tenant_id_personals_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_appointment_request_id_appointment_requests_id_fk" FOREIGN KEY ("appointment_request_id") REFERENCES "public"."appointment_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availability_exceptions" ADD CONSTRAINT "availability_exceptions_tenant_id_personals_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availability_rules" ADD CONSTRAINT "availability_rules_tenant_id_personals_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "admins_user_id_idx" ON "admins" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "personals_user_id_idx" ON "personals" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "personals_slug_idx" ON "personals" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "password_reset_tokens_hash_idx" ON "password_reset_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "password_setup_tokens_hash_idx" ON "password_setup_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "students_user_id_idx" ON "students" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "students_tenant_id_idx" ON "students" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "exercises_tenant_id_idx" ON "exercises" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "exercises_muscle_group_idx" ON "exercises" USING btree ("muscle_group");--> statement-breakpoint
CREATE INDEX "coach_student_relations_tenant_id_idx" ON "coach_student_relations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "coach_student_relations_student_id_idx" ON "coach_student_relations" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "coaching_contracts_tenant_id_idx" ON "coaching_contracts" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "coaching_contracts_student_id_idx" ON "coaching_contracts" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "service_plans_tenant_id_idx" ON "service_plans" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "student_notes_tenant_id_idx" ON "student_notes" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "student_notes_student_id_idx" ON "student_notes" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "exercise_templates_workout_template_id_idx" ON "exercise_templates" USING btree ("workout_template_id");--> statement-breakpoint
CREATE INDEX "program_templates_tenant_id_idx" ON "program_templates" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "student_exercises_workout_day_id_idx" ON "student_exercises" USING btree ("workout_day_id");--> statement-breakpoint
CREATE INDEX "student_programs_tenant_id_idx" ON "student_programs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "student_programs_student_id_idx" ON "student_programs" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "workout_days_student_program_id_idx" ON "workout_days" USING btree ("student_program_id");--> statement-breakpoint
CREATE INDEX "workout_templates_program_template_id_idx" ON "workout_templates" USING btree ("program_template_id");--> statement-breakpoint
CREATE INDEX "exercise_executions_workout_session_id_idx" ON "exercise_executions" USING btree ("workout_session_id");--> statement-breakpoint
CREATE INDEX "exercise_sets_exercise_execution_id_idx" ON "exercise_sets" USING btree ("exercise_execution_id");--> statement-breakpoint
CREATE INDEX "workout_sessions_tenant_id_idx" ON "workout_sessions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "workout_sessions_student_id_idx" ON "workout_sessions" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "workout_sessions_workout_day_id_idx" ON "workout_sessions" USING btree ("workout_day_id");--> statement-breakpoint
CREATE INDEX "progress_photos_tenant_id_idx" ON "progress_photos" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "progress_photos_student_id_idx" ON "progress_photos" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "progress_records_tenant_id_idx" ON "progress_records" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "progress_records_student_id_idx" ON "progress_records" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "appointment_requests_tenant_id_idx" ON "appointment_requests" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "appointment_requests_student_id_idx" ON "appointment_requests" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "appointments_tenant_id_idx" ON "appointments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "appointments_student_id_idx" ON "appointments" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "appointments_start_at_idx" ON "appointments" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX "availability_exceptions_tenant_id_idx" ON "availability_exceptions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "availability_rules_tenant_id_idx" ON "availability_rules" USING btree ("tenant_id");