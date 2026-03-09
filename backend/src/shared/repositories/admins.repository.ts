import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import { admins, Admin } from "@config/database/schema/admins";

type DrizzleDb = NodePgDatabase<typeof schema>;

@Injectable()
export class AdminsRepository {
  constructor(private drizzle: DrizzleProvider) {}

  async findByUserId(userId: string, tx?: DrizzleDb): Promise<Admin | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select()
      .from(admins)
      .where(eq(admins.userId, userId))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: { userId: string }, tx?: DrizzleDb): Promise<Admin> {
    const db = tx ?? this.drizzle.db;
    const result = await db.insert(admins).values(data).returning();
    return result[0];
  }
}
