CREATE TABLE "coach_invitation_tokens" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"email" varchar(255) NOT NULL,
	"plan_id" varchar(36) NOT NULL,
	"is_whitelisted" boolean DEFAULT false NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "coach_invitation_tokens" ADD CONSTRAINT "coach_invitation_tokens_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "coach_invitation_tokens_hash_idx" ON "coach_invitation_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "coach_invitation_tokens_email_idx" ON "coach_invitation_tokens" USING btree ("email");