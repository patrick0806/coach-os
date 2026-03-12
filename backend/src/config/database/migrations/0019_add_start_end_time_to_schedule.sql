-- Rename scheduled_time -> start_time and add end_time in schedule_rules
ALTER TABLE "schedule_rules" RENAME COLUMN "scheduled_time" TO "start_time";
--> statement-breakpoint
ALTER TABLE "schedule_rules" ADD COLUMN "end_time" varchar(5);
--> statement-breakpoint

-- Rename scheduled_time -> start_time and add end_time in training_sessions
ALTER TABLE "training_sessions" RENAME COLUMN "scheduled_time" TO "start_time";
--> statement-breakpoint
ALTER TABLE "training_sessions" ADD COLUMN "end_time" varchar(5);
