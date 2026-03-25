import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { env } from "@config/env";
import { ResendProvider } from "@shared/providers/resend.provider";
import { CoachInvitationTokensRepository } from "@shared/repositories/coachInvitationTokens.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { generateSetupToken, expiresInHours } from "@shared/utils/token.util";
import { validate } from "@shared/utils/validation.util";

const inviteCoachSchema = z.object({
  name: z.string().min(3).max(150),
  email: z.email().max(255),
  planId: z.uuid(),
  isWhitelisted: z.boolean().default(false),
});

const INVITE_TOKEN_EXPIRY_HOURS = 7 * 24; // 7 days

@Injectable()
export class InviteCoachUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly plansRepository: PlansRepository,
    private readonly coachInvitationTokensRepository: CoachInvitationTokensRepository,
    private readonly resendProvider: ResendProvider,
  ) { }

  async execute(body: unknown): Promise<{ message: string }> {
    const data = validate(inviteCoachSchema, body);

    // Check if email is already registered
    const existingUser = await this.usersRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException("Já existe um registro com esse email");
    }

    // Validate plan exists
    const plan = await this.plansRepository.findById(data.planId);
    if (!plan) {
      throw new NotFoundException("Plano não encontrado");
    }

    // Invalidate previous tokens for this email
    await this.coachInvitationTokensRepository.invalidateByEmail(data.email);

    // Generate invitation token
    const { raw, hash } = generateSetupToken();
    await this.coachInvitationTokensRepository.create({
      name: data.name,
      email: data.email,
      planId: data.planId,
      isWhitelisted: data.isWhitelisted,
      tokenHash: hash,
      expiresAt: expiresInHours(INVITE_TOKEN_EXPIRY_HOURS),
    });

    // Build invite URL and send email (fire-and-forget)
    const setupPasswordUrl = `${env.APP_URL}/aceitar-convite-coach?token=${raw}`;
    await this.resendProvider.sendCoachInvite({
      to: data.email,
      coachName: data.name,
      setupPasswordUrl,
    });

    return { message: "Invitation sent successfully" };
  }
}
