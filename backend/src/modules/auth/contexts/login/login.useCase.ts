import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { z } from "zod";

import { env } from "@config/env";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces/accessToken.interface";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { generateSetupToken } from "@shared/utils/token.util";
import { validate } from "@shared/utils/validation.util";

const loginSchema = z.object({
  email: z.email().max(255),
  password: z.string().min(1),
});

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: { id: string; name: string; email: string; role: string; tenantId: string; personalSlug?: string };
  personal?: { id: string; slug: string };
}

const INVALID_CREDENTIALS_MESSAGE = "Email ou senha inválidos";

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly personalsRepository: PersonalsRepository,
    private readonly studentsRepository: StudentsRepository,
    private readonly jwtService: JwtService,
  ) { }

  async execute(body: unknown): Promise<LoginResult> {
    const data = validate(loginSchema, body);

    const user = await this.usersRepository.findByEmail(data.email);

    // Always run argon2 verify to prevent timing attacks
    const dummyHash = "$argon2id$v=19$m=65536,t=3,p=4$dummy$dummy";
    const passwordValid = user
      ? await argon2.verify(user.password, data.password + env.HASH_PEPPER)
      : (await argon2.verify(dummyHash, data.password + env.HASH_PEPPER).catch(() => false));

    if (!user || !passwordValid) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    if (!user.isActive) {
      throw new UnauthorizedException("Conta desativada");
    }

    // Resolve profile based on role
    if (user.role === ApplicationRoles.PERSONAL) {
      const personal = await this.personalsRepository.findByUserId(user.id);

      if (!personal) {
        throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
      }

      const tokenPayload: IAccessToken = {
        sub: user.id,
        role: ApplicationRoles.PERSONAL,
        profileId: personal.id,
        personalId: personal.id,
        personalSlug: personal.slug,
      };

      const accessToken = this.jwtService.sign(tokenPayload);
      const { raw: refreshToken, hash: refreshTokenHash } = generateSetupToken();
      await this.usersRepository.updateRefreshTokenHash(user.id, refreshTokenHash);

      return {
        accessToken,
        refreshToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: personal.id },
        personal: { id: personal.id, slug: personal.slug },
      };
    }

    // Student login flow
    if (user.role === ApplicationRoles.STUDENT) {
      const student = await this.studentsRepository.findByUserId(user.id);

      if (!student) {
        throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
      }

      // Get the coach's personal record to retrieve the slug
      const personal = await this.personalsRepository.findById(student.tenantId);

      if (!personal) {
        throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
      }

      const tokenPayload: IAccessToken = {
        sub: user.id,
        role: ApplicationRoles.STUDENT,
        profileId: student.id,
        personalId: student.tenantId,
        personalSlug: personal.slug,
      };

      const accessToken = this.jwtService.sign(tokenPayload);
      const { raw: refreshToken, hash: refreshTokenHash } = generateSetupToken();
      await this.usersRepository.updateRefreshTokenHash(user.id, refreshTokenHash);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: student.tenantId,
          personalSlug: personal.slug,
        },
      };
    }

    // Other roles are not yet supported
    throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
  }
}
