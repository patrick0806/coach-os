import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { timingSafeEqual } from "crypto";

import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { generateSetupToken, hashToken } from "@shared/utils/token.util";

const COOKIE_SEPARATOR = ".";

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly personalsRepository: PersonalsRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(cookieValue: string | undefined): Promise<RefreshTokenResult> {
    if (!cookieValue) {
      throw new UnauthorizedException("No refresh token provided");
    }

    // Cookie format: userId.rawToken
    const dotIndex = cookieValue.indexOf(COOKIE_SEPARATOR);
    if (dotIndex === -1) {
      throw new UnauthorizedException("Invalid refresh token format");
    }

    const userId = cookieValue.substring(0, dotIndex);
    const rawToken = cookieValue.substring(dotIndex + 1);

    if (!userId || !rawToken) {
      throw new UnauthorizedException("Invalid refresh token format");
    }

    const user = await this.usersRepository.findById(userId);

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    // Timing-safe hash comparison to prevent token oracle attacks
    const incomingHash = hashToken(rawToken);
    const isValid = this.compareHashes(incomingHash, user.refreshTokenHash);

    if (!isValid) {
      // Token reuse detected — invalidate stored token immediately
      await this.usersRepository.updateRefreshTokenHash(userId, null);
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("Account is disabled");
    }

    // Resolve profile based on role to build JWT payload
    if (user.role === ApplicationRoles.PERSONAL) {
      const personal = await this.personalsRepository.findByUserId(user.id);

      if (!personal) {
        throw new UnauthorizedException("Profile not found");
      }

      const tokenPayload: IAccessToken = {
        sub: user.id,
        role: ApplicationRoles.PERSONAL,
        profileId: personal.id,
        personalId: personal.id,
        personalSlug: personal.slug,
      };

      const accessToken = this.jwtService.sign(tokenPayload);

      // Rotate refresh token
      const { raw: refreshToken, hash: refreshTokenHash } = generateSetupToken();
      await this.usersRepository.updateRefreshTokenHash(user.id, refreshTokenHash);

      return { accessToken, refreshToken };
    }

    throw new UnauthorizedException("Unsupported role");
  }

  private compareHashes(incoming: string, stored: string): boolean {
    try {
      return timingSafeEqual(Buffer.from(incoming, "hex"), Buffer.from(stored, "hex"));
    } catch {
      return false;
    }
  }
}
