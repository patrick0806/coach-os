CREATE TABLE "workout_sessions" (
  "id" varchar(36) PRIMARY KEY NOT NULL,
  "student_id" varchar(36) NOT NULL REFERENCES "students"("id"),
  "workout_plan_id" varchar(36) NOT NULL REFERENCES "workout_plans"("id"),
  "status" varchar(20) NOT NULL DEFAULT 'active',
  "current_step" integer NOT NULL DEFAULT 0,
  "started_at" timestamp with time zone NOT NULL DEFAULT now(),
  "completed_at" timestamp with time zone
);

CREATE INDEX "idx_workout_sessions_student_id" ON "workout_sessions" ("student_id");
CREATE INDEX "idx_workout_sessions_plan_id" ON "workout_sessions" ("workout_plan_id");
CREATE INDEX "idx_workout_sessions_status" ON "workout_sessions" ("status");
