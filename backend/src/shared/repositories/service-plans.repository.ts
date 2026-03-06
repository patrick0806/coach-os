import { Injectable } from "@nestjs/common";
import { eq, and } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import {
  servicePlans,
  ServicePlan,
  NewServicePlan,
} from "@config/database/schema/availability";

type DrizzleDb = NodePgDatabase<typeof schema>;

@Injectable()
export class ServicePlansRepository {
  constructor(private drizzle: DrizzleProvider) {}

  async findActiveByPersonalId(
    personalId: string,
    tx?: DrizzleDb,
  ): Promise<ServicePlan[]> {
    const db = tx ?? this.drizzle.db;
    return db
      .select()
      .from(servicePlans)
      .where(
        and(
          eq(servicePlans.personalId, personalId),
          eq(servicePlans.isActive, true),
        ),
      );
  }

  async findById(id: string, tx?: DrizzleDb): Promise<ServicePlan | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select()
      .from(servicePlans)
      .where(eq(servicePlans.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: NewServicePlan, tx?: DrizzleDb): Promise<ServicePlan> {
    const db = tx ?? this.drizzle.db;
    const result = await db.insert(servicePlans).values(data).returning();
    return result[0];
  }
}
