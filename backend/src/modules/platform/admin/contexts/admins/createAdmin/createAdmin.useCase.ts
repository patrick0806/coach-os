import { ConflictException, Injectable } from "@nestjs/common";
import * as argon2 from "argon2";

import { env } from "@config/env";
import { ApplicationRoles } from "@shared/enums";
import { AdminsRepository } from "@shared/repositories/admins.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { validate } from "@shared/utils/validation.util";

import { createAdminSchema } from "./dtos/request.dto";

@Injectable()
export class CreateAdminUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly adminsRepository: AdminsRepository,
  ) { }

  async execute(body: unknown) {
    const data = validate(createAdminSchema, body);

    const existing = await this.usersRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictException("Já existe um registro com esse email");
    }

    const hashedPassword = await argon2.hash(data.password + env.HASH_PEPPER);

    const user = await this.usersRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: ApplicationRoles.ADMIN,
    });

    const admin = await this.adminsRepository.create({ userId: user.id });

    return {
      id: admin.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      createdAt: admin.createdAt,
    };
  }
}
