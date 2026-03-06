import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import * as argon2 from "argon2";

import { UsersRepository } from "@shared/repositories/users.repository";
import { ApplicationRoles } from "@shared/enums";
import { env } from "@config/env";

import { AuthTokenService } from "../../services/authToken.service";
import { LoginServiceInput } from "./dtos";

export interface LoginServiceResult {
  accessToken: string;
  refreshToken: string;
  role: ApplicationRoles;
  personalSlug: string | null;
}

@Injectable()
export class LoginService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async execute(dto: LoginServiceInput): Promise<LoginServiceResult> {
    const user = await this.usersRepository.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    if (!user.password) {
      throw new UnauthorizedException(
        "Senha não definida. Verifique seu e-mail de convite.",
      );
    }

    const isValid = await argon2.verify(
      user.password,
      dto.password + env.HASH_PEPPER,
    );

    if (!isValid) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    if (!user.isActive) {
      throw new ForbiddenException("Conta inativa");
    }

    const payload = await this.authTokenService.buildPayload(user);
    const accessToken = this.authTokenService.signAccessToken(payload);
    const refreshToken = this.authTokenService.signRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      role: user.role as ApplicationRoles,
      personalSlug: payload.personalSlug,
    };
  }
}
