import { Injectable } from "@nestjs/common";
import { and, eq, isNull } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { DbTransaction, DrizzleProvider } from "@shared/providers/drizzle.service";
import {
  passwordResetTokens,
  passwordSetupTokens,
} from "@config/database/schema/passwordTokens";

export type PasswordResetToken = InferSelectModel<typeof passwordResetTokens>;
export type PasswordSetupToken = InferSelectModel<typeof passwordSetupTokens>;

@Injectable()
export class PasswordTokensRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async createResetToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<PasswordResetToken> {
    const result = await this.drizzle.db
      .insert(passwordResetTokens)
      .values(data)
      .returning();

    return result[0];
  }

  async createSetupToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<PasswordSetupToken> {
    const result = await this.drizzle.db
      .insert(passwordSetupTokens)
      .values(data)
      .returning();

    return result[0];
  }

  async findResetTokenByHash(tokenHash: string): Promise<PasswordResetToken | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.tokenHash, tokenHash))
      .limit(1);

    return result[0];
  }

  async findSetupTokenByHash(tokenHash: string): Promise<PasswordSetupToken | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(passwordSetupTokens)
      .where(eq(passwordSetupTokens.tokenHash, tokenHash))
      .limit(1);

    return result[0];
  }

  async markResetTokenAsUsed(id: string, tx?: DbTransaction): Promise<void> {
    // Drizzle ORM type inference limitation: usedAt is not inferred in the SET type
     
    await (tx ?? this.drizzle.db)
      .update(passwordResetTokens)
      .set({ usedAt: new Date() } as any)
      .where(eq(passwordResetTokens.id, id));
  }

  async markSetupTokenAsUsed(id: string, tx?: DbTransaction): Promise<void> {
    // Drizzle ORM type inference limitation: usedAt is not inferred in the SET type
     
    await (tx ?? this.drizzle.db)
      .update(passwordSetupTokens)
      .set({ usedAt: new Date() } as any)
      .where(eq(passwordSetupTokens.id, id));
  }

  async invalidateResetTokensByUserId(userId: string): Promise<void> {
    // Mark all unused reset tokens for this user as used to prevent token accumulation
     
    await this.drizzle.db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() } as any)
      .where(
        and(
          eq(passwordResetTokens.userId, userId),
          isNull(passwordResetTokens.usedAt),
        ),
      );
  }

  async invalidateSetupTokensByUserId(userId: string): Promise<void> {
    // Mark all unused setup tokens for this user as used to prevent token accumulation
     
    await this.drizzle.db
      .update(passwordSetupTokens)
      .set({ usedAt: new Date() } as any)
      .where(
        and(
          eq(passwordSetupTokens.userId, userId),
          isNull(passwordSetupTokens.usedAt),
        ),
      );
  }
}
