import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { AdminsRepository } from "@shared/repositories/admins.repository";
import { IAccessToken } from "@shared/interfaces";
import { ApplicationRoles } from "@shared/enums";
import { env } from "@config/env";

type UserRef = { id: string; role: string };

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly personalsRepository: PersonalsRepository,
    private readonly studentsRepository: StudentsRepository,
    private readonly adminsRepository: AdminsRepository,
  ) {}

  async buildPayload(user: UserRef): Promise<IAccessToken> {
    switch (user.role as ApplicationRoles) {
      case ApplicationRoles.PERSONAL: {
        const personal = await this.personalsRepository.findByUserId(user.id);
        if (!personal) throw new UnauthorizedException("Perfil não encontrado");
        return {
          sub: user.id,
          role: ApplicationRoles.PERSONAL,
          profileId: personal.id,
          personalId: personal.id,
          personalSlug: personal.slug,
        };
      }

      case ApplicationRoles.STUDENT: {
        const student = await this.studentsRepository.findByUserId(user.id);
        if (!student) throw new UnauthorizedException("Perfil não encontrado");
        const personal = await this.personalsRepository.findById(
          student.personalId,
        );
        if (!personal) throw new UnauthorizedException("Coach não encontrado");
        return {
          sub: user.id,
          role: ApplicationRoles.STUDENT,
          profileId: student.id,
          personalId: personal.id,
          personalSlug: personal.slug,
        };
      }

      case ApplicationRoles.ADMIN: {
        const admin = await this.adminsRepository.findByUserId(user.id);
        if (!admin) throw new UnauthorizedException("Perfil não encontrado");
        return {
          sub: user.id,
          role: ApplicationRoles.ADMIN,
          profileId: admin.id,
          personalId: null,
          personalSlug: null,
        };
      }

      default:
        throw new UnauthorizedException("Role inválida");
    }
  }

  signAccessToken(payload: IAccessToken): string {
    return this.jwtService.sign(payload);
  }

  signRefreshToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: env.JWT_REFRESH_SECRET,
        expiresIn: env.JWT_REFRESH_EXPIRATION as any,
      },
    );
  }

  verifyRefreshToken(token: string): { sub: string } {
    return this.jwtService.verify<{ sub: string }>(token, {
      secret: env.JWT_REFRESH_SECRET,
    });
  }
}
