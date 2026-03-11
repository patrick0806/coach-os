import { BadRequestException, Injectable } from "@nestjs/common";
import * as argon2 from "argon2";

import { UsersRepository } from "@shared/repositories/users.repository";
import { PasswordResetTokensRepository } from "@shared/repositories/password-reset-tokens.repository";
import { hashToken } from "@shared/utils";
import { env } from "@config/env";

import { ResetPasswordDTO, ResetPasswordSchema } from "./dtos/request.dto";

@Injectable()
export class ResetPasswordService {
  constructor(
    private readonly passwordResetTokensRepository: PasswordResetTokensRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(dto: ResetPasswordDTO): Promise<{ message: string }> {
    const parsed = ResetPasswordSchema.safeParse(dto);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      throw new BadRequestException(first.message);
    }

    const { token, password } = parsed.data;

    const tokenHash = hashToken(token);
    const tokenRecord =
      await this.passwordResetTokensRepository.findValidByTokenHash(tokenHash);

    if (!tokenRecord) {
      throw new BadRequestException("Token inválido ou expirado");
    }

    const hashedPassword = await argon2.hash(password + env.HASH_PEPPER, {
      type: argon2.argon2id,
    });

    await Promise.all([
      this.usersRepository.update(tokenRecord.userId, {
        password: hashedPassword,
      }),
      this.passwordResetTokensRepository.markAsUsed(tokenRecord.id),
    ]);

    return { message: "Senha redefinida com sucesso" };
  }
}
