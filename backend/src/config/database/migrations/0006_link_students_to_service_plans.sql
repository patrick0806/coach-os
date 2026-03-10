ALTER TABLE "students" ADD COLUMN "service_plan_id" varchar(36);--> statement-breakpoint
UPDATE "students" s
SET "service_plan_id" = p."service_plan_id"
FROM (
  SELECT DISTINCT ON (b."student_id")
    b."student_id",
    b."service_plan_id"
  FROM "bookings" b
  WHERE b."service_plan_id" IS NOT NULL
  ORDER BY b."student_id", b."created_at" DESC
) p
WHERE s."id" = p."student_id";--> statement-breakpoint
UPDATE "students" s
SET "service_plan_id" = p."id"
FROM (
  SELECT DISTINCT ON (sp."personal_id")
    sp."personal_id",
    sp."id"
  FROM "service_plans" sp
  WHERE sp."is_active" = true
  ORDER BY sp."personal_id", sp."created_at" ASC
) p
WHERE s."personal_id" = p."personal_id"
  AND s."service_plan_id" IS NULL;--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "students" WHERE "service_plan_id" IS NULL) THEN
    RAISE EXCEPTION 'Existem alunos sem plano de atendimento vinculado. Crie ao menos um plano ativo por personal e vincule os alunos antes de aplicar esta migration.';
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "students" ALTER COLUMN "service_plan_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_service_plan_id_service_plans_id_fk" FOREIGN KEY ("service_plan_id") REFERENCES "public"."service_plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "students_service_plan_id_idx" ON "students" USING btree ("service_plan_id");
