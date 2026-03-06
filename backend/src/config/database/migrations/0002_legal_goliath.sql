ALTER TABLE "personals" ADD COLUMN "stripe_customer_id" varchar(255);--> statement-breakpoint
ALTER TABLE "personals" ADD COLUMN "stripe_subscription_id" varchar(255);--> statement-breakpoint
ALTER TABLE "personals" ADD COLUMN "subscription_status" varchar(50);--> statement-breakpoint
ALTER TABLE "personals" ADD COLUMN "subscription_plan_id" varchar(36);--> statement-breakpoint
ALTER TABLE "personals" ADD COLUMN "subscription_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "personals" ADD CONSTRAINT "personals_subscription_plan_id_plans_id_fk" FOREIGN KEY ("subscription_plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "personals_stripe_customer_idx" ON "personals" USING btree ("stripe_customer_id");--> statement-breakpoint
ALTER TABLE "personals" ADD CONSTRAINT "personals_stripe_customer_id_unique" UNIQUE("stripe_customer_id");--> statement-breakpoint
ALTER TABLE "personals" ADD CONSTRAINT "personals_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id");