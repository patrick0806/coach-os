import { Injectable } from "@nestjs/common";
import { and, eq, gt, isNull } from "drizzle-orm";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { studentInvitationTokens } from "@config/database/schema/studentInvitationTokens";
import type { InferSelectModel } from "drizzle-orm";

export type StudentInvitationToken = InferSelectModel<typeof studentInvitationTokens>;

@Injectable()
export class StudentInvitationTokensRepository {
  constructor(private readonly drizzle: DrizzleProvider) {}

  async create(data: {
    tenantId: string;
    email: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<StudentInvitationToken> {
    const result = await this.drizzle.db
      .insert(studentInvitationTokens)
      .values(data)
      .returning();

    return result[0];
  }

  async findByTokenHash(tokenHash: string): Promise<StudentInvitationToken | undefined> {
    const result = await this.drizzle.db
      .select()
      .from(studentInvitationTokens)
      .where(eq(studentInvitationTokens.tokenHash, tokenHash))
      .limit(1);

    return result[0];
  }

  async findActiveByEmailAndTenant(
    email: string,
    tenantId: string,
  ): Promise<StudentInvitationToken | undefined> {
    const now = new Date();
    const result = await this.drizzle.db
      .select()
      .from(studentInvitationTokens)
      .where(
        and(
          eq(studentInvitationTokens.email, email),
          eq(studentInvitationTokens.tenantId, tenantId),
          isNull(studentInvitationTokens.usedAt),
          gt(studentInvitationTokens.expiresAt, now),
        ),
      )
      .limit(1);

    return result[0];
  }

  async invalidateByEmailAndTenant(email: string, tenantId: string): Promise<void> {
    // Drizzle ORM type inference limitation: usedAt is not inferred in the SET type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.drizzle.db
      .update(studentInvitationTokens)
      .set({ usedAt: new Date() } as any)
      .where(
        and(
          eq(studentInvitationTokens.email, email),
          eq(studentInvitationTokens.tenantId, tenantId),
          isNull(studentInvitationTokens.usedAt),
        ),
      );
  }

  async markAsUsed(id: string): Promise<void> {
    // Drizzle ORM type inference limitation: usedAt is not inferred in the SET type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.drizzle.db
      .update(studentInvitationTokens)
      .set({ usedAt: new Date() } as any)
      .where(eq(studentInvitationTokens.id, id));
  }
}
