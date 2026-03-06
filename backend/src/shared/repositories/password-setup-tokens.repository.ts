import { Injectable } from "@nestjs/common";
import { and, eq, gt, isNull } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import * as schema from "@config/database/schema";
import {
  passwordSetupTokens,
  PasswordSetupToken,
  NewPasswordSetupToken,
} from "@config/database/schema/password-setup-tokens";

type DrizzleDb = NodePgDatabase<typeof schema>;

@Injectable()
export class PasswordSetupTokensRepository {
  constructor(private drizzle: DrizzleProvider) {}

  async create(
    data: NewPasswordSetupToken,
    tx?: DrizzleDb,
  ): Promise<PasswordSetupToken> {
    const db = tx ?? this.drizzle.db;
    const result = await db
      .insert(passwordSetupTokens)
      .values(data)
      .returning();
    return result[0];
  }

  async findValidByTokenHash(
    tokenHash: string,
    tx?: DrizzleDb,
  ): Promise<PasswordSetupToken | null> {
    const db = tx ?? this.drizzle.db;
    const now = new Date();
    const result = await db
      .select()
      .from(passwordSetupTokens)
      .where(
        and(
          eq(passwordSetupTokens.tokenHash, tokenHash),
          gt(passwordSetupTokens.expiresAt, now),
          isNull(passwordSetupTokens.usedAt),
        ),
      )
      .limit(1);
    return result[0] ?? null;
  }

  async markAsUsed(id: string, tx?: DrizzleDb): Promise<void> {
    const db = tx ?? this.drizzle.db;
    await db
      .update(passwordSetupTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordSetupTokens.id, id));
  }
}
