CREATE TABLE "plans" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" varchar(255) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"highlighted" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"benefits" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
