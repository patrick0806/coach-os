import { Injectable, Logger } from "@nestjs/common";

import { UsersRepository } from "@shared/repositories/users.repository";
import { PasswordResetTokensRepository } from "@shared/repositories/password-reset-tokens.repository";
import { generateSetupToken, expiresInHours } from "@shared/utils";
import { ResendProvider } from "@shared/providers/resend.provider";
import { env } from "@config/env";

import { ForgotPasswordDTO, ForgotPasswordSchema } from "./dtos/request.dto";

@Injectable()
export class ForgotPasswordService {
  private readonly logger = new Logger(ForgotPasswordService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordResetTokensRepository: PasswordResetTokensRepository,
    private readonly resendProvider: ResendProvider,
  ) {}

  async execute(dto: ForgotPasswordDTO): Promise<{ message: string }> {
    const parsed = ForgotPasswordSchema.safeParse(dto);
    if (!parsed.success) {
      // Return success anyway for security if email is invalid format
      return { message: "Se o e-mail estiver cadastrado, você receberá um link de recuperação." };
    }

    const { email } = parsed.data;
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      this.logger.debug(`Forgot password requested for non-existent email: ${email}`);
      return { message: "Se o e-mail estiver cadastrado, você receberá um link de recuperação." };
    }

    // 1. Invalidate previous tokens
    await this.passwordResetTokensRepository.invalidateAllForUser(user.id);

    // 2. Generate new token
    const { raw: rawToken, hash: tokenHash } = generateSetupToken();
    const expiresAt = expiresInHours(2); // Valid for 2 hours

    // 3. Save to DB
    await this.passwordResetTokensRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    // 4. Send email
    const resetPasswordUrl = `${env.APP_URL}/redefinir-senha?token=${rawToken}`;
    
    await this.resendProvider.sendPasswordReset({
      to: email,
      userName: user.name,
      resetPasswordUrl,
    });

    return { message: "Se o e-mail estiver cadastrado, você receberá um link de recuperação." };
  }
}
