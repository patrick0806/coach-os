import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import * as argon2 from "argon2";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { UsersRepository } from "@shared/repositories/users.repository";
import { AdminsRepository } from "@shared/repositories/admins.repository";
import { ApplicationRoles } from "@shared/enums";
import { env } from "@config/env";

import { RegisterServiceInput, RegisterResponseDTO } from "./dtos";

@Injectable()
export class RegisterService {
  constructor(
    private usersRepository: UsersRepository,
    private adminRepository: AdminsRepository,
    private drizzle: DrizzleProvider,
  ) { }

  async execute(dto: RegisterServiceInput): Promise<RegisterResponseDTO> {
    if (!env.CAN_CREATE_ADMIN) {
      throw new ForbiddenException("Não é possível criar administradores");
    }

    const existingUser = await this.usersRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException("E-mail já está em uso");
    }
    const hashedPassword = await argon2.hash(
      dto.password + env.HASH_PEPPER,
      { type: argon2.argon2id },
    );

    const result = await this.drizzle.db.transaction(async (tx) => {
      const user = await this.usersRepository.create(
        {
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
          role: ApplicationRoles.ADMIN,
        },
        tx,
      );

      const personal = await this.adminRepository.create(
        {
          userId: user.id,
        },
        tx,
      );

      return { user, personal };
    });

    return {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role
    };
  }
}
