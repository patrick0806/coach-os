import { BadRequestException, Injectable } from "@nestjs/common";
import * as argon2 from "argon2";

import { UsersRepository } from "@shared/repositories/users.repository";
import { PasswordSetupTokensRepository } from "@shared/repositories/password-setup-tokens.repository";
import { hashToken } from "@shared/utils";
import { env } from "@config/env";

import { SetupPasswordDTO, SetupPasswordSchema } from "./dtos/request.dto";

@Injectable()
export class SetupPasswordService {
  constructor(
    private readonly passwordSetupTokensRepository: PasswordSetupTokensRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(dto: SetupPasswordDTO): Promise<{ message: string }> {
    const parsed = SetupPasswordSchema.safeParse(dto);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      throw new BadRequestException(first.message);
    }

    const { token, password } = parsed.data;

    const tokenHash = hashToken(token);
    const tokenRecord =
      await this.passwordSetupTokensRepository.findValidByTokenHash(tokenHash);

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
      this.passwordSetupTokensRepository.markAsUsed(tokenRecord.id),
    ]);

    return { message: "Senha definida com sucesso" };
  }
}
