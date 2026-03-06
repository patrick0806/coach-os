import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import { plans, Plans } from "@config/database/schema/plans";

type DrizzleDb = NodePgDatabase<typeof schema>;

@Injectable()
export class PlansRepository {
  constructor(private drizzle: DrizzleProvider) {}

  async findById(id: string, tx?: DrizzleDb): Promise<Plans | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
    return result[0] ?? null;
  }

  async findAllActive(tx?: DrizzleDb): Promise<Plans[]> {
    const db = tx ?? this.drizzle.db;
    return db
      .select()
      .from(plans)
      .where(eq(plans.isActive, true))
      .orderBy(plans.order);
  }
}
