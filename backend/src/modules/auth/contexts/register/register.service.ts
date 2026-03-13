import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import * as argon2 from "argon2";
import { addDays } from "date-fns";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { UsersRepository } from "@shared/repositories/users.repository";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { generateUniqueSlug } from "@shared/utils";
import { ApplicationRoles } from "@shared/enums";
import { env } from "@config/env";

import { RegisterServiceInput, RegisterResponseDTO } from "./dtos";

@Injectable()
export class RegisterService {
  constructor(
    private usersRepository: UsersRepository,
    private personalsRepository: PersonalsRepository,
    private plansRepository: PlansRepository,
    private drizzle: DrizzleProvider,
  ) {}

  async execute(dto: RegisterServiceInput): Promise<RegisterResponseDTO> {
    const existingUser = await this.usersRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException("E-mail já está em uso");
    }

    const slug = await generateUniqueSlug(dto.name, this.personalsRepository);
    const basicPlan = await this.plansRepository.findDefault();
    if (!basicPlan) {
      throw new NotFoundException("Nenhum plano padrão disponível para cadastro");
    }

    const hashedPassword = await argon2.hash(
      dto.password + env.HASH_PEPPER,
      { type: argon2.argon2id },
    );

    const result = await this.drizzle.db.transaction(async (tx) => {
      const now = new Date();
      const trialEndsAt = addDays(now, 30);

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
          trialStartedAt: now,
          trialEndsAt,
          accessStatus: "trialing",
          subscriptionPlanId: basicPlan.id,
          subscriptionStatus: "trialing",
          subscriptionExpiresAt: trialEndsAt,
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
