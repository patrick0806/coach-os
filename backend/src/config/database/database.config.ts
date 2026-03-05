import { Pool, PoolConfig } from "pg";

import { env } from "../env";

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
