ALTER TABLE "workout_plans" ADD COLUMN "plan_kind" varchar(10) DEFAULT 'template' NOT NULL;--> statement-breakpoint
ALTER TABLE "workout_plans" ADD COLUMN "source_template_id" varchar(36);--> statement-breakpoint
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_source_template_id_workout_plans_id_fk" FOREIGN KEY ("source_template_id") REFERENCES "public"."workout_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_workout_plans_personal_kind" ON "workout_plans" USING btree ("personal_id","plan_kind");