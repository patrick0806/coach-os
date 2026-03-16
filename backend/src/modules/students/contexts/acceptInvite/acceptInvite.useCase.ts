import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import * as argon2 from "argon2";
import { z } from "zod";

import { env } from "@config/env";
import { ApplicationRoles } from "@shared/enums";
import { CoachStudentRelationsRepository } from "@shared/repositories/coachStudentRelations.repository";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { StudentInvitationTokensRepository } from "@shared/repositories/studentInvitationTokens.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { hashToken } from "@shared/utils/token.util";
import { validate } from "@shared/utils/validation.util";

const acceptInviteSchema = z.object({
  token: z.string().min(1),
  name: z.string().min(3).max(150),
  password: z.string().min(8).max(100),
});

const INVALID_TOKEN_MESSAGE = "Invalid or expired invitation token";

@Injectable()
export class AcceptInviteUseCase {
  constructor(
    private readonly studentInvitationTokensRepository: StudentInvitationTokensRepository,
    private readonly usersRepository: UsersRepository,
    private readonly studentsRepository: StudentsRepository,
    private readonly personalsRepository: PersonalsRepository,
    private readonly plansRepository: PlansRepository,
    private readonly coachStudentRelationsRepository: CoachStudentRelationsRepository,
  ) { }

  async execute(body: unknown): Promise<{ message: string }> {
    const data = validate(acceptInviteSchema, body);

    // Verify invitation token
    const tokenHash = hashToken(data.token);
    const tokenRecord = await this.studentInvitationTokensRepository.findByTokenHash(tokenHash);

    if (!tokenRecord) throw new UnauthorizedException(INVALID_TOKEN_MESSAGE);
    if (tokenRecord.usedAt) throw new UnauthorizedException(INVALID_TOKEN_MESSAGE);
    if (tokenRecord.expiresAt < new Date()) throw new UnauthorizedException(INVALID_TOKEN_MESSAGE);

    const { tenantId, email } = tokenRecord;

    const personal = await this.personalsRepository.findById(tenantId);
    if (!personal) throw new NotFoundException("Personal not found");

    const plan = await this.plansRepository.findById(personal.subscriptionPlanId);
    if (!plan) throw new NotFoundException("Plan not found");

    // Re-check student limit for token's tenant
    const count = await this.studentsRepository.countByTenantId(tenantId);
    if (count >= plan.maxStudents) {
      throw new ForbiddenException("Student limit reached for this coach");
    }

    // Hash password with pepper
    const hashedPassword = await argon2.hash(data.password + env.HASH_PEPPER);

    // Create user with STUDENT role
    const user = await this.usersRepository.create({
      name: data.name,
      email,
      password: hashedPassword,
      role: ApplicationRoles.STUDENT,
    });

    // Create student record
    const student = await this.studentsRepository.create({
      userId: user.id,
      tenantId,
      status: "active",
    });

    // Create coach-student relation
    await this.coachStudentRelationsRepository.create({
      tenantId,
      studentId: student.id,
      status: "active",
      startDate: new Date(),
    });

    // Mark invitation token as used
    await this.studentInvitationTokensRepository.markAsUsed(tokenRecord.id);

    return { message: "Account created successfully" };
  }
}
