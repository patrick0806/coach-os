import { Pool } from "pg";
import { getDatabaseConfig } from "@config/database/database.config";

async function resetMigrations() {
  console.log("Resetting database...");

  const pool = new Pool(getDatabaseConfig());

  try {
    // Drop all application tables in dependency order (child → parent), CASCADE handles the rest
    const dropStatements = [
      // Layer 5: Workout execution
      'DROP TABLE IF EXISTS "exercise_sets" CASCADE',
      'DROP TABLE IF EXISTS "exercise_executions" CASCADE',
      'DROP TABLE IF EXISTS "workout_sessions" CASCADE',
      // Layer 4: Training (student programs + templates)
      'DROP TABLE IF EXISTS "student_exercises" CASCADE',
      'DROP TABLE IF EXISTS "workout_days" CASCADE',
      'DROP TABLE IF EXISTS "student_programs" CASCADE',
      'DROP TABLE IF EXISTS "exercise_templates" CASCADE',
      'DROP TABLE IF EXISTS "workout_templates" CASCADE',
      'DROP TABLE IF EXISTS "program_templates" CASCADE',
      // Layer 3: Coaching, scheduling, progress
      'DROP TABLE IF EXISTS "student_notes" CASCADE',
      'DROP TABLE IF EXISTS "coaching_contracts" CASCADE',
      'DROP TABLE IF EXISTS "service_plans" CASCADE',
      'DROP TABLE IF EXISTS "coach_student_relations" CASCADE',
      'DROP TABLE IF EXISTS "training_schedules" CASCADE',
      'DROP TABLE IF EXISTS "appointments" CASCADE',
      'DROP TABLE IF EXISTS "appointment_requests" CASCADE',
      'DROP TABLE IF EXISTS "availability_exceptions" CASCADE',
      'DROP TABLE IF EXISTS "availability_rules" CASCADE',
      'DROP TABLE IF EXISTS "progress_records" CASCADE',
      'DROP TABLE IF EXISTS "progress_photos" CASCADE',
      'DROP TABLE IF EXISTS "progress_checkins" CASCADE',
      // Layer 2: Students, exercises, invitations
      'DROP TABLE IF EXISTS "student_invitation_tokens" CASCADE',
      'DROP TABLE IF EXISTS "students" CASCADE',
      'DROP TABLE IF EXISTS "exercises" CASCADE',
      // Layer 1: Auth profiles, tokens
      'DROP TABLE IF EXISTS "password_setup_tokens" CASCADE',
      'DROP TABLE IF EXISTS "password_reset_tokens" CASCADE',
      'DROP TABLE IF EXISTS "admins" CASCADE',
      'DROP TABLE IF EXISTS "personals" CASCADE',
      // Layer 0: Base tables
      'DROP TABLE IF EXISTS "plans" CASCADE',
      'DROP TABLE IF EXISTS "users" CASCADE',
      // Drop drizzle migration history (stored in the "drizzle" schema, not "public")
      'DROP SCHEMA IF EXISTS "drizzle" CASCADE',
    ];

    for (const stmt of dropStatements) {
      await pool.query(stmt);
    }

    console.log("✓ All tables and migration history dropped");
    console.log("Database reset successfully! Run: npm run db:migrate");
  } catch (error) {
    console.error("Reset failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log("Database connection closed");
  }
}

resetMigrations();
