import { Pool } from "pg";
import { getDatabaseConfig } from "@config/database/database.config";

async function resetMigrations() {
  console.log("Resetting migration history...");

  const pool = new Pool(getDatabaseConfig());

  try {
    await pool.query('DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE');
    console.log("✓ Dropped __drizzle_migrations table");

    console.log("Migration history reset successfully!");
    console.log("You can now run: npm run db:migrate");
  } catch (error) {
    console.error("Reset failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log("Database connection closed");
  }
}

resetMigrations();
