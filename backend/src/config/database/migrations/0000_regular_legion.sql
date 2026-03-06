CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"email" varchar(150) NOT NULL,
	"password" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"role" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" varchar(255) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"highlighted" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"benefits" json NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personals" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"bio" text,
	"profile_photo" varchar(500),
	"theme_color" varchar(7) DEFAULT '#10b981' NOT NULL,
	"phone_number" varchar(20),
	"lp_title" varchar(255),
	"lp_subtitle" varchar(255),
	"lp_hero_image" varchar(500),
	"lp_about_title" varchar(255),
	"lp_about_text" text,
	"lp_image1" varchar(500),
	"lp_image2" varchar(500),
	"lp_image3" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "personals_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "personals_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"personal_id" varchar(36) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "students_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "admins" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admins_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"muscle_group" varchar(100) NOT NULL,
	"personal_id" varchar(36),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_exercises" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"workout_plan_id" varchar(36) NOT NULL,
	"exercise_id" varchar(36) NOT NULL,
	"sets" integer NOT NULL,
	"repetitions" integer NOT NULL,
	"load" varchar(50),
	"order" integer DEFAULT 0 NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "workout_plan_students" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"workout_plan_id" varchar(36) NOT NULL,
	"student_id" varchar(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_plans" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"personal_id" varchar(36) NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "availability_slots" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"personal_id" varchar(36) NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
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
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workout_plan_id_workout_plans_id_fk" FOREIGN KEY ("workout_plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plan_students" ADD CONSTRAINT "workout_plan_students_workout_plan_id_workout_plans_id_fk" FOREIGN KEY ("workout_plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plan_students" ADD CONSTRAINT "workout_plan_students_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_personal_id_personals_id_fk" FOREIGN KEY ("personal_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availability_slots" ADD CONSTRAINT "availability_slots_personal_id_personals_id_fk" FOREIGN KEY ("personal_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_personal_id_personals_id_fk" FOREIGN KEY ("personal_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_plan_id_service_plans_id_fk" FOREIGN KEY ("service_plan_id") REFERENCES "public"."service_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_plans" ADD CONSTRAINT "service_plans_personal_id_personals_id_fk" FOREIGN KEY ("personal_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "personals_slug_idx" ON "personals" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "personals_user_id_idx" ON "personals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "personals_created_at_idx" ON "personals" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "students_user_id_idx" ON "students" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "students_personal_id_idx" ON "students" USING btree ("personal_id");--> statement-breakpoint
CREATE UNIQUE INDEX "admins_user_id_idx" ON "admins" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_exercises_personal_id" ON "exercises" USING btree ("personal_id");--> statement-breakpoint
CREATE INDEX "idx_exercises_muscle_group" ON "exercises" USING btree ("muscle_group");--> statement-breakpoint
CREATE INDEX "idx_workout_exercises_workout_plan_id" ON "workout_exercises" USING btree ("workout_plan_id");--> statement-breakpoint
CREATE INDEX "idx_workout_exercises_exercise_id" ON "workout_exercises" USING btree ("exercise_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_workout_plan_student" ON "workout_plan_students" USING btree ("workout_plan_id","student_id");--> statement-breakpoint
CREATE INDEX "idx_workout_plan_students_student_id" ON "workout_plan_students" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_workout_plans_personal_id" ON "workout_plans" USING btree ("personal_id");--> statement-breakpoint
CREATE INDEX "idx_availability_slots_personal_id" ON "availability_slots" USING btree ("personal_id");--> statement-breakpoint
CREATE INDEX "idx_availability_slots_day" ON "availability_slots" USING btree ("day_of_week");--> statement-breakpoint
CREATE INDEX "idx_bookings_personal_id" ON "bookings" USING btree ("personal_id");--> statement-breakpoint
CREATE INDEX "idx_bookings_student_id" ON "bookings" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_bookings_date" ON "bookings" USING btree ("scheduled_date");--> statement-breakpoint
CREATE INDEX "idx_bookings_status" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_booking_time" ON "bookings" USING btree ("personal_id","scheduled_date","start_time");--> statement-breakpoint
CREATE INDEX "idx_service_plans_personal_id" ON "service_plans" USING btree ("personal_id");