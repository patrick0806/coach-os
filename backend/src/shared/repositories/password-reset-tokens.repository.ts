import { Injectable } from "@nestjs/common";
import { and, eq, gt, isNull } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import {
  passwordResetTokens,
  PasswordResetToken,
} from "@config/database/schema/password-reset-tokens";

type DrizzleDb = NodePgDatabase<typeof schema>;

export interface CreatePasswordResetTokenInput {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

@Injectable()
export class PasswordResetTokensRepository {
  constructor(private drizzle: DrizzleProvider) {}

  async create(
    data: CreatePasswordResetTokenInput,
    tx?: DrizzleDb,
  ): Promise<PasswordResetToken> {
    const db = tx ?? this.drizzle.db;
    // Cast needed: Drizzle v0.39 $inferInsert narrowing excludes nullable columns
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await db.insert(passwordResetTokens).values(data as any).returning();
    return result[0];
  }

  async findValidByTokenHash(
    tokenHash: string,
    tx?: DrizzleDb,
  ): Promise<PasswordResetToken | null> {
    const db = tx ?? this.drizzle.db;
    const now = new Date();
    const result = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          gt(passwordResetTokens.expiresAt, now),
          isNull(passwordResetTokens.usedAt),
        ),
      )
      .limit(1);
    return result[0] ?? null;
  }

  async markAsUsed(id: string, tx?: DrizzleDb): Promise<void> {
    const db = tx ?? this.drizzle.db;
    // Cast needed: usedAt is nullable — excluded from Drizzle v0.39 set() keys
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.update(passwordResetTokens).set({ usedAt: new Date() } as any).where(eq(passwordResetTokens.id, id));
  }

  async invalidateAllForUser(userId: string, tx?: DrizzleDb): Promise<void> {
    const db = tx ?? this.drizzle.db;
    // Mark all as used to invalidate previous tokens
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.update(passwordResetTokens).set({ usedAt: new Date() } as any).where(eq(passwordResetTokens.userId, userId));
  }
}
