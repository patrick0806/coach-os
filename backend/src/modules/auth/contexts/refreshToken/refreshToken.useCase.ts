import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { timingSafeEqual } from "crypto";

import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";
import { AdminsRepository } from "@shared/repositories/admins.repository";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
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
    private readonly studentsRepository: StudentsRepository,
    private readonly adminsRepository: AdminsRepository,
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

    // Student refresh token flow
    if (user.role === ApplicationRoles.STUDENT) {
      const student = await this.studentsRepository.findByUserId(user.id);

      if (!student) {
        throw new UnauthorizedException("Profile not found");
      }

      // Get the coach's personal record to retrieve the slug
      const personal = await this.personalsRepository.findById(student.tenantId);

      if (!personal) {
        throw new UnauthorizedException("Profile not found");
      }

      const tokenPayload: IAccessToken = {
        sub: user.id,
        role: ApplicationRoles.STUDENT,
        profileId: student.id,
        personalId: student.tenantId,
        personalSlug: personal.slug,
      };

      const accessToken = this.jwtService.sign(tokenPayload);

      // Rotate refresh token
      const { raw: refreshToken, hash: refreshTokenHash } = generateSetupToken();
      await this.usersRepository.updateRefreshTokenHash(user.id, refreshTokenHash);

      return { accessToken, refreshToken };
    }

    // Admin refresh token flow
    if (user.role === ApplicationRoles.ADMIN) {
      const admin = await this.adminsRepository.findByUserId(user.id);

      if (!admin) {
        throw new UnauthorizedException("Profile not found");
      }

      const tokenPayload: IAccessToken = {
        sub: user.id,
        role: ApplicationRoles.ADMIN,
        profileId: admin.id,
        personalId: null,
        personalSlug: null,
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
