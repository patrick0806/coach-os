import { Injectable, UnauthorizedException } from "@nestjs/common";

import { UsersRepository } from "@shared/repositories/users.repository";

import { AuthTokenService } from "../../services/authToken.service";
import { RefreshResponseDTO } from "./dtos/response.dto";

@Injectable()
export class RefreshService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async execute(refreshToken: string): Promise<RefreshResponseDTO> {
    let userId: string;

    try {
      const payload = this.authTokenService.verifyRefreshToken(refreshToken);
      userId = payload.sub;
    } catch {
      throw new UnauthorizedException("Refresh token inválido ou expirado");
    }

    const user = await this.usersRepository.findById(userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedException("Usuário não encontrado ou inativo");
    }

    const tokenPayload = await this.authTokenService.buildPayload(user);
    const accessToken = this.authTokenService.signAccessToken(tokenPayload);

    return { accessToken };
  }
}
