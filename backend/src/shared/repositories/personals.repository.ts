import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import {
  personals,
  Personal,
  NewPersonal,
} from "@config/database/schema/personals";

type DrizzleDb = NodePgDatabase<typeof schema>;

@Injectable()
export class PersonalsRepository {
  constructor(private drizzle: DrizzleProvider) {}

  async findBySlug(slug: string, tx?: DrizzleDb): Promise<Personal | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select()
      .from(personals)
      .where(eq(personals.slug, slug))
      .limit(1);
    return result[0] ?? null;
  }

  async findByUserId(userId: string, tx?: DrizzleDb): Promise<Personal | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select()
      .from(personals)
      .where(eq(personals.userId, userId))
      .limit(1);
    return result[0] ?? null;
  }

  async findById(id: string, tx?: DrizzleDb): Promise<Personal | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select()
      .from(personals)
      .where(eq(personals.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: NewPersonal, tx?: DrizzleDb): Promise<Personal> {
    const db = tx ?? this.drizzle.db;
    const result = await db.insert(personals).values(data).returning();
    return result[0];
  }
}
