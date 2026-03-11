CREATE TABLE "student_notes" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"student_id" varchar(36) NOT NULL,
	"personal_id" varchar(36) NOT NULL,
	"note" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "student_notes_student_created_at_idx" ON "student_notes" USING btree ("student_id","created_at");--> statement-breakpoint
CREATE INDEX "student_notes_personal_id_idx" ON "student_notes" USING btree ("personal_id");