ALTER TABLE "plans" ADD COLUMN "is_default" boolean DEFAULT false NOT NULL;

-- Mark the plan with the lowest order as the default entry-level plan
UPDATE "plans" SET "is_default" = true WHERE id = (
  SELECT id FROM plans ORDER BY "order" ASC LIMIT 1
);
