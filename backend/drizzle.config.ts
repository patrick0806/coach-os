import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/config/database/schema/index.ts",
  out: "./src/config/database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "5432", 10),
    user: process.env.DATABASE_USER || "postgres",
    password: process.env.DATABASE_PASSWORD || "123",
    database: process.env.DATABASE_NAME || "personal_saas_db",
    ssl: process.env.DATABASE_SSL === "true",
  },
  verbose: true,
  strict: true,
});
