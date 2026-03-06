import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import { users, User, NewUser } from "@config/database/schema/users";

type DrizzleDb = NodePgDatabase<typeof schema>;

@Injectable()
export class UsersRepository {
  constructor(private drizzle: DrizzleProvider) {}

  async findByEmail(email: string, tx?: DrizzleDb): Promise<User | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] ?? null;
  }

  async findById(id: string, tx?: DrizzleDb): Promise<User | null> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: NewUser, tx?: DrizzleDb): Promise<User> {
    const db = tx ?? this.drizzle.db;
    const result = await db.insert(users).values(data).returning();
    return result[0];
  }
}
