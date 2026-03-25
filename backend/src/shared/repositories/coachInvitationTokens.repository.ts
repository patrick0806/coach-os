import { Injectable } from "@nestjs/common";
import { and, eq, isNull } from "drizzle-orm";

import { DbTransaction, DrizzleProvider } from "@shared/providers/drizzle.service";
import { coachInvitationTokens } from "@config/database/schema/coachInvitationTokens";
import type { InferSelectModel } from "drizzle-orm";

export type CoachInvitationToken = InferSelectModel<typeof coachInvitationTokens>;

@Injectable()
export class CoachInvitationTokensRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async create(data: {
    name: string;
    email: string;
    planId: string;
    isWhitelisted: boolean;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<CoachInvitationToken> {
    const result = await this.drizzle.db
      .insert(coachInvitationTokens)
      .values(data)
      .returning();

    return result[0];
  }

  async findByTokenHash(tokenHash: string): Promise<CoachInvitationToken | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(coachInvitationTokens)
      .where(eq(coachInvitationTokens.tokenHash, tokenHash))
      .limit(1);

    return result[0];
  }

  async invalidateByEmail(email: string): Promise<void> {
    // Drizzle ORM type inference limitation: usedAt is not inferred in the SET type
    await this.drizzle.db
      .update(coachInvitationTokens)
      .set({ usedAt: new Date() } as any)
      .where(
        and(
          eq(coachInvitationTokens.email, email),
          isNull(coachInvitationTokens.usedAt),
        ),
      );
  }

  async markAsUsed(id: string, tx?: DbTransaction): Promise<void> {
    // Drizzle ORM type inference limitation: usedAt is not inferred in the SET type
    await (tx ?? this.drizzle.db)
      .update(coachInvitationTokens)
      .set({ usedAt: new Date() } as any)
      .where(eq(coachInvitationTokens.id, id));
  }
}
