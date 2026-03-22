import { Injectable } from "@nestjs/common";
import { z } from "zod";

import { env } from "@config/env";
import { PasswordTokensRepository } from "@shared/repositories/passwordTokens.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { ResendProvider } from "@shared/providers/resend.provider";
import { generateSetupToken, expiresInHours } from "@shared/utils/token.util";
import { validate } from "@shared/utils/validation.util";

const RESET_TOKEN_EXPIRY_HOURS = 2;

const requestPasswordResetSchema = z.object({
  email: z.email().max(255),
  slug: z.string().max(100).optional(),
});

@Injectable()
export class RequestPasswordResetUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordTokensRepository: PasswordTokensRepository,
    private readonly resendProvider: ResendProvider,
  ) { }

  async execute(body: unknown): Promise<void> {
    const data = validate(requestPasswordResetSchema, body);

    // Always return silently to prevent email enumeration
    const user = await this.usersRepository.findByEmail(data.email);
    if (!user) {
      return;
    }

    // Invalidate previous reset tokens before creating a new one
    await this.passwordTokensRepository.invalidateResetTokensByUserId(user.id);

    // Generate token — only the hash is stored, raw token is sent via email
    const { raw, hash } = generateSetupToken();
    await this.passwordTokensRepository.createResetToken({
      userId: user.id,
      tokenHash: hash,
      expiresAt: expiresInHours(RESET_TOKEN_EXPIRY_HOURS),
    });

    // Branded student URL when slug is provided; global URL for coach/admin
    const resetPasswordUrl = data.slug
      ? `${env.APP_URL}/coach/${data.slug}/redefinir-senha?token=${raw}`
      : `${env.APP_URL}/redefinir-senha?token=${raw}`;

    await this.resendProvider.sendPasswordReset({
      to: user.email,
      userName: user.name,
      resetPasswordUrl,
    });
  }
}
