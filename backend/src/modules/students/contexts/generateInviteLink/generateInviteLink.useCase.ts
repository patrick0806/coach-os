import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { StudentInvitationTokensRepository } from "@shared/repositories/studentInvitationTokens.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { generateSetupToken, expiresInHours } from "@shared/utils/token.util";
import { buildStudentUrl } from "@shared/utils/studentUrl.util";
import { validate } from "@shared/utils/validation.util";

const generateInviteLinkSchema = z.object({
  name: z.string().min(3).max(150),
  email: z.email().max(255),
});

const INVITE_TOKEN_EXPIRY_HOURS = 48;

export interface GenerateInviteLinkResult {
  inviteLink: string;
}

@Injectable()
export class GenerateInviteLinkUseCase {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly personalsRepository: PersonalsRepository,
    private readonly plansRepository: PlansRepository,
    private readonly studentInvitationTokensRepository: StudentInvitationTokensRepository,
  ) { }

  async execute(body: unknown, tenantId: string): Promise<GenerateInviteLinkResult> {
    const data = validate(generateInviteLinkSchema, body);

    const personal = await this.personalsRepository.findById(tenantId);
    if (!personal) throw new NotFoundException("Personal not found");

    const plan = await this.plansRepository.findById(personal.subscriptionPlanId);
    if (!plan) throw new NotFoundException("Plano não encontrado");


    // Check student limit (skip for whitelisted accounts)
    if (!personal.isWhitelisted) {
      const count = await this.studentsRepository.countByTenantId(tenantId);
      if (count >= plan.maxStudents) {
        throw new ForbiddenException("Student limit reached for your current plan");
      }
    }

    // Check if student already exists in this tenant
    const existingUser = await this.usersRepository.findByEmail(data.email);
    if (existingUser) {
      const existingStudent = await this.studentsRepository.findByUserIdAndTenantId(
        existingUser.id,
        tenantId,
      );
      if (existingStudent) {
        throw new ConflictException("A student with this email already exists in your account");
      }
    }

    // Invalidate previous tokens and create new one
    await this.studentInvitationTokensRepository.invalidateByEmailAndTenant(data.email, tenantId);

    const { raw, hash } = generateSetupToken();
    await this.studentInvitationTokensRepository.create({
      tenantId,
      email: data.email,
      tokenHash: hash,
      expiresAt: expiresInHours(INVITE_TOKEN_EXPIRY_HOURS),
    });

    return {
      inviteLink: buildStudentUrl(personal.slug, `/accept-invite?token=${raw}`),
    };
  }
}
