import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as argon2 from "argon2";
import { z } from "zod";

import { env } from "@config/env";
import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { UsersRepository } from "@shared/repositories/users.repository";
import { validate } from "@shared/utils/validation.util";

const changePasswordSchema = z.object({
  userId: z.string().uuid(),
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly drizzle: DrizzleProvider,
  ) {}

  async execute(body: unknown): Promise<void> {
    const data = validate(changePasswordSchema, body);

    const user = await this.usersRepository.findById(data.userId);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isCurrentPasswordValid = await argon2.verify(
      user.password,
      data.currentPassword + env.HASH_PEPPER,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    const hashedNewPassword = await argon2.hash(data.newPassword + env.HASH_PEPPER);

    // Atomic transaction: update password and invalidate all active sessions
    await this.drizzle.db.transaction(async (tx) => {
      await this.usersRepository.updatePassword(data.userId, hashedNewPassword, tx);
      await this.usersRepository.updateRefreshTokenHash(data.userId, null, tx);
    });
  }
}
