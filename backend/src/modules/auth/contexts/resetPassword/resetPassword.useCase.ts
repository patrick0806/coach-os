import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as argon2 from "argon2";
import { z } from "zod";

import { env } from "@config/env";
import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { PasswordTokensRepository } from "@shared/repositories/passwordTokens.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { hashToken } from "@shared/utils/token.util";
import { validate } from "@shared/utils/validation.util";

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(100),
});

const INVALID_TOKEN_MESSAGE = "Invalid or expired token";

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordTokensRepository: PasswordTokensRepository,
    private readonly drizzle: DrizzleProvider,
  ) {}

  async execute(body: unknown): Promise<void> {
    const data = validate(resetPasswordSchema, body);

    const hashedToken = hashToken(data.token);
    const tokenRecord = await this.passwordTokensRepository.findResetTokenByHash(hashedToken);

    if (!tokenRecord) {
      throw new UnauthorizedException(INVALID_TOKEN_MESSAGE);
    }

    if (tokenRecord.usedAt) {
      throw new UnauthorizedException(INVALID_TOKEN_MESSAGE);
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException(INVALID_TOKEN_MESSAGE);
    }

    const hashedPassword = await argon2.hash(data.password + env.HASH_PEPPER);

    // Atomic transaction: all writes succeed together or none are applied
    await this.drizzle.db.transaction(async (tx) => {
      await this.usersRepository.updatePassword(tokenRecord.userId, hashedPassword, tx);
      await this.passwordTokensRepository.markResetTokenAsUsed(tokenRecord.id, tx);
      // Invalidate all active sessions to force re-login with the new password
      await this.usersRepository.updateRefreshTokenHash(tokenRecord.userId, null, tx);
    });
  }
}
