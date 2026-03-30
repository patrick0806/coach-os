import { Pool, PoolConfig, types } from "pg";

import { env } from "../env";

// Override pg's default date parser (OID 1082) to return raw "YYYY-MM-DD"
// strings instead of JavaScript Date objects. Without this, Drizzle's date()
// columns return Date objects at runtime despite being typed as string.
types.setTypeParser(1082, (val: string) => val);

export const getDatabaseConfig = (): PoolConfig => {
  const config: PoolConfig = {
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
    ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : false,
    min: 2,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };

  return config;
};

export const createDatabasePool = (): Pool => {
  const pool = new Pool(getDatabaseConfig());

  pool.on("error", (err) => {
    console.error("Unexpected database error on idle client", err);
    process.exit(-1);
  });

  return pool;
};
