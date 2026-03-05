CREATE TABLE "exercises" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"muscle_group" varchar(100) NOT NULL,
	"personal_id" varchar(36),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workout_exercises" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"workout_plan_id" varchar(36) NOT NULL,
	"exercise_id" varchar(36) NOT NULL,
	"sets" integer NOT NULL,
	"repetitions" integer NOT NULL,
	"load" varchar(50),
	"order" integer DEFAULT 0,
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
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "idx_exercises_personal_id" ON "exercises" USING btree ("personal_id");--> statement-breakpoint
CREATE INDEX "idx_exercises_muscle_group" ON "exercises" USING btree ("muscle_group");--> statement-breakpoint
CREATE INDEX "idx_workout_exercises_workout_plan_id" ON "workout_exercises" USING btree ("workout_plan_id");--> statement-breakpoint
CREATE INDEX "idx_workout_exercises_exercise_id" ON "workout_exercises" USING btree ("exercise_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_workout_plan_student" ON "workout_plan_students" USING btree ("workout_plan_id","student_id");--> statement-breakpoint
CREATE INDEX "idx_workout_plan_students_student_id" ON "workout_plan_students" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_workout_plans_personal_id" ON "workout_plans" USING btree ("personal_id");