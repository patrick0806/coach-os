import path from "path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

import { getDatabaseConfig } from "@config/database/database.config";

async function runMigrations() {
  console.log("Starting database migration...");

  const pool = new Pool(getDatabaseConfig());
  const db = drizzle(pool);

  // __dirname resolves to src/config/database in dev (tsx) and dist/config/database in prod (node)
  const migrationsFolder = path.join(__dirname, "migrations");

  try {
    await migrate(db, { migrationsFolder });
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log("Database connection closed");
  }
}

runMigrations();
