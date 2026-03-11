import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import { users, User } from "@config/database/schema/users";

type DrizzleDb = NodePgDatabase<typeof schema>;

// Explicit input types — avoids relying on Drizzle $inferInsert
// which in v0.39 only surfaces NOT NULL / no-default columns as keys.
export interface CreateUserInput {
  name: string;
  email: string;
  password: string | null;
  role: string;
  isActive?: boolean;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string | null;
  isActive?: boolean;
}

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

  async create(data: CreateUserInput, tx?: DrizzleDb): Promise<User> {
    const db = tx ?? this.drizzle.db;
    // Cast needed: Drizzle $inferInsert only surfaces required keys
     
    const result = await db.insert(users).values(data as any).returning();
    return result[0];
  }

  async update(id: string, data: UpdateUserInput, tx?: DrizzleDb): Promise<User> {
    const db = tx ?? this.drizzle.db;
    // Cast needed: same Drizzle v0.39 $inferUpdate narrowing issue
     
    const result = await db.update(users).set(data as any).where(eq(users.id, id)).returning();
    return result[0];
  }
}
