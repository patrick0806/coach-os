ALTER TABLE "users" ADD COLUMN "refresh_token_hash" varchar(255);--> statement-breakpoint
ALTER TABLE "personals" DROP COLUMN IF EXISTS "refresh_token_hash";