import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { drizzle, NodePgDatabase, NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import { Pool } from "pg";

import { createDatabasePool } from "@config/database/database.config";

import { LogBuilderService } from "./LogBuilder.service";

import * as schema from "@config/database/schema";

/** Drizzle transaction context — accepted by repository methods that support transactional writes. */
export type DbTransaction = PgTransaction<
  NodePgQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

@Injectable()
export class DrizzleProvider implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private _db: NodePgDatabase<typeof schema>;

  constructor() {
    this.pool = createDatabasePool();
    this._db = drizzle(this.pool, { schema });
  }

  async onModuleInit() {
    try {
      await this.pool.query("SELECT 1");
      //LogBuilderService.log("info", "Database connection established");
    } catch (error) {
      LogBuilderService.log("error", "Failed to connect to database", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.pool.end();
      LogBuilderService.log("info", "Database connection closed gracefully");
    } catch (error) {
      LogBuilderService.log("error", "Error closing database connection", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  get db(): NodePgDatabase<typeof schema> {
    return this._db;
  }

  get client(): Pool {
    return this.pool;
  }
}
