import { ConflictException, Injectable } from "@nestjs/common";
import * as argon2 from "argon2";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { UsersRepository } from "@shared/repositories/users.repository";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { generateUniqueSlug } from "@shared/utils";
import { ApplicationRoles } from "@shared/enums";
import { env } from "@config/env";

import { RegisterServiceInput, RegisterResponseDTO } from "./dtos";

@Injectable()
export class RegisterService {
  constructor(
    private usersRepository: UsersRepository,
    private personalsRepository: PersonalsRepository,
    private drizzle: DrizzleProvider,
  ) {}

  async execute(dto: RegisterServiceInput): Promise<RegisterResponseDTO> {
    const existingUser = await this.usersRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException("E-mail já está em uso");
    }

    const slug = await generateUniqueSlug(dto.name, this.personalsRepository);

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
          role: ApplicationRoles.PERSONAL,
        },
        tx,
      );

      const personal = await this.personalsRepository.create(
        {
          userId: user.id,
          slug,
        },
        tx,
      );

      return { user, personal };
    });

    return {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      profile: {
        id: result.personal.id,
        slug: result.personal.slug,
      },
    };
  }
}
