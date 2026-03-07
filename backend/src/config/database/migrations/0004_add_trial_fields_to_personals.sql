ALTER TABLE "personals"
ADD COLUMN "trial_started_at" timestamp with time zone DEFAULT now() NOT NULL;

ALTER TABLE "personals"
ADD COLUMN "trial_ends_at" timestamp with time zone DEFAULT now() + interval '30 days' NOT NULL;

ALTER TABLE "personals"
ADD COLUMN "access_status" varchar(30) DEFAULT 'trialing' NOT NULL;
