import { Injectable, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import * as argon2 from "argon2";

import { UsersRepository } from "@shared/repositories/users.repository";
import { User } from "@config/database/schema/users";
import { env } from "@config/env";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersRepository: UsersRepository) {
    super({ usernameField: "email" });
  }

  async validate(email: string, password: string): Promise<User> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const isValid = await argon2.verify(
      user.password,
      password + env.HASH_PEPPER,
    );

    if (!isValid) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    if (!user.isActive) {
      throw new ForbiddenException("Conta inativa");
    }

    return user;
  }
}
