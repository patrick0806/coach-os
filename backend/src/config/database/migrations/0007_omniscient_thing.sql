ALTER TABLE "personals" ADD COLUMN "lp_draft_data" json DEFAULT 'null'::json;--> statement-breakpoint
ALTER TABLE "personals" ADD COLUMN "tour_completed_pages" json DEFAULT '[]'::json;