CREATE TABLE "student_invitation_tokens" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"email" varchar(255) NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "personals" ADD COLUMN "logo_url" varchar(500);--> statement-breakpoint
ALTER TABLE "personals" ADD COLUMN "specialties" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "personals" ADD COLUMN "onboarding_completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "status" varchar(20) DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "phone_number" varchar(20);--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "goal" varchar(300);--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "observations" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "physical_restrictions" text;--> statement-breakpoint
ALTER TABLE "student_invitation_tokens" ADD CONSTRAINT "student_invitation_tokens_tenant_id_personals_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "student_invitation_tokens_hash_idx" ON "student_invitation_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "student_invitation_tokens_tenant_id_idx" ON "student_invitation_tokens" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "student_invitation_tokens_email_idx" ON "student_invitation_tokens" USING btree ("email");