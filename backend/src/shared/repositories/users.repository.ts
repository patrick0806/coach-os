import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { DbTransaction, DrizzleProvider } from "@shared/providers/drizzle.service";
import { users } from "@config/database/schema/users";
import type { InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof users>;

@Injectable()
export class UsersRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0];
  }

  async findById(id: string): Promise<User | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0];
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    role: "ADMIN" | "PERSONAL" | "STUDENT";
  }): Promise<User> {
    const result = await this.drizzle.db
      .insert(users)
      .values(data)
      .returning();

    return result[0];
  }

  async updateRefreshTokenHash(
    id: string,
    refreshTokenHash: string | null,
    tx?: DbTransaction,
  ): Promise<void> {
    // Drizzle ORM type inference limitation: refreshTokenHash is not inferred in the SET type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (tx ?? this.drizzle.db)
      .update(users)
      .set({ refreshTokenHash } as any)
      .where(eq(users.id, id));
  }

  async updatePassword(id: string, hashedPassword: string, tx?: DbTransaction): Promise<void> {
    await (tx ?? this.drizzle.db)
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id));
  }
}
