CREATE TABLE "personals" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"bio" text,
	"profile_photo" varchar(500),
	"theme_color" varchar(7) DEFAULT '#10b981' NOT NULL,
	"phone_number" varchar(20),
	"lp_title" varchar(255),
	"lp_subtitle" varchar(255),
	"lp_hero_image" varchar(500),
	"lp_about_title" varchar(255),
	"lp_about_text" text,
	"lp_image1" varchar(500),
	"lp_image2" varchar(500),
	"lp_image3" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "personals_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "personals_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"email" varchar(150) NOT NULL,
	"password" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true,
	"personal_id" varchar(36) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "personals_slug_idx" ON "personals" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "personals_user_id_idx" ON "personals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "personals_created_at_idx" ON "personals" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "students_personal_id_idx" ON "students" USING btree ("personal_id");--> statement-breakpoint
CREATE UNIQUE INDEX "students_email_personal_idx" ON "students" USING btree ("email","personal_id");