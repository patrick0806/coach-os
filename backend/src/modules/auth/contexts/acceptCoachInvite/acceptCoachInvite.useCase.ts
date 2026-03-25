import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import * as argon2 from "argon2";
import { addDays } from "date-fns";
import { z } from "zod";

import { env } from "@config/env";
import { ApplicationRoles } from "@shared/enums";
import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { CoachInvitationTokensRepository } from "@shared/repositories/coachInvitationTokens.repository";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { hashToken } from "@shared/utils/token.util";
import { generateUniqueSlug } from "@shared/utils/generateUniqueSlug.util";
import { validate } from "@shared/utils/validation.util";

const acceptCoachInviteSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(100),
});

const TRIAL_DAYS = 14;
const INVALID_TOKEN_MESSAGE = "Invalid or expired invitation token";

@Injectable()
export class AcceptCoachInviteUseCase {
  constructor(
    private readonly coachInvitationTokensRepository: CoachInvitationTokensRepository,
    private readonly usersRepository: UsersRepository,
    private readonly plansRepository: PlansRepository,
    private readonly personalsRepository: PersonalsRepository,
    private readonly drizzle: DrizzleProvider,
  ) { }

  async execute(body: unknown): Promise<{ message: string }> {
    const data = validate(acceptCoachInviteSchema, body);

    // Verify invitation token
    const tokenHash = hashToken(data.token);
    const tokenRecord = await this.coachInvitationTokensRepository.findByTokenHash(tokenHash);

    if (!tokenRecord) throw new UnauthorizedException(INVALID_TOKEN_MESSAGE);
    if (tokenRecord.usedAt) throw new UnauthorizedException(INVALID_TOKEN_MESSAGE);
    if (tokenRecord.expiresAt < new Date()) throw new UnauthorizedException(INVALID_TOKEN_MESSAGE);

    const { name, email, planId, isWhitelisted } = tokenRecord;

    // Check if email is already taken (race condition guard)
    const existingUser = await this.usersRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException("Já existe um registro com esse email");
    }

    // Validate plan still exists
    const plan = await this.plansRepository.findById(planId);
    if (!plan) {
      throw new NotFoundException("Plano não encontrado");
    }

    // Hash password with pepper
    const hashedPassword = await argon2.hash(data.password + env.HASH_PEPPER);

    // Generate unique slug (before transaction — read-only)
    const slug = await generateUniqueSlug(name, this.personalsRepository);

    const now = new Date();

    await this.drizzle.db.transaction(async (tx) => {
      const user = await this.usersRepository.create(
        {
          name,
          email,
          password: hashedPassword,
          role: ApplicationRoles.PERSONAL,
        },
        tx,
      );

      if (isWhitelisted) {
        await this.personalsRepository.create(
          {
            userId: user.id,
            slug,
            accessStatus: "active",
            subscriptionPlanId: planId,
            isWhitelisted: true,
          },
          tx,
        );
      } else {
        await this.personalsRepository.create(
          {
            userId: user.id,
            slug,
            accessStatus: "trialing",
            subscriptionPlanId: planId,
            isWhitelisted: false,
            trialStartedAt: now,
            trialEndsAt: addDays(now, TRIAL_DAYS),
          },
          tx,
        );
      }

      await this.coachInvitationTokensRepository.markAsUsed(tokenRecord.id, tx);
    });

    return { message: "Conta criada com sucesso" };
  }
}
