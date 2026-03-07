import { Pool } from "pg";
import { getDatabaseConfig } from "@config/database/database.config";

async function resetMigrations() {
  console.log("Resetting database...");

  const pool = new Pool(getDatabaseConfig());

  try {
    // Drop all application tables in dependency order (child → parent), CASCADE handles the rest
    const dropStatements = [
      'DROP TABLE IF EXISTS "workout_exercises" CASCADE',
      'DROP TABLE IF EXISTS "workout_plan_students" CASCADE',
      'DROP TABLE IF EXISTS "workout_plans" CASCADE',
      'DROP TABLE IF EXISTS "bookings" CASCADE',
      'DROP TABLE IF EXISTS "service_plans" CASCADE',
      'DROP TABLE IF EXISTS "availability_slots" CASCADE',
      'DROP TABLE IF EXISTS "password_setup_tokens" CASCADE',
      'DROP TABLE IF EXISTS "students" CASCADE',
      'DROP TABLE IF EXISTS "admins" CASCADE',
      'DROP TABLE IF EXISTS "personals" CASCADE',
      'DROP TABLE IF EXISTS "exercises" CASCADE',
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
