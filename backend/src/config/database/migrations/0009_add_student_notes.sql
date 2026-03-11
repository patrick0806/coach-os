CREATE TABLE "student_notes" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"student_id" varchar(36) NOT NULL,
	"personal_id" varchar(36) NOT NULL,
	"note" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "student_notes" ADD CONSTRAINT "student_notes_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "student_notes" ADD CONSTRAINT "student_notes_personal_id_personals_id_fk" FOREIGN KEY ("personal_id") REFERENCES "public"."personals"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "student_notes_student_created_at_idx" ON "student_notes" USING btree ("student_id","created_at");
--> statement-breakpoint
CREATE INDEX "student_notes_personal_id_idx" ON "student_notes" USING btree ("personal_id");
