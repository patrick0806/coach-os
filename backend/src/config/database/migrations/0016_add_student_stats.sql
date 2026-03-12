ALTER TABLE "students" ADD COLUMN "current_streak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "last_workout_date" date;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "total_workouts" integer DEFAULT 0 NOT NULL;