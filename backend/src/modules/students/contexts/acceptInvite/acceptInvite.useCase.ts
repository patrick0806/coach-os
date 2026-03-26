import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import * as argon2 from "argon2";
import { z } from "zod";

import { env } from "@config/env";
import { ApplicationRoles } from "@shared/enums";
import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { CoachStudentRelationsRepository } from "@shared/repositories/coachStudentRelations.repository";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { StudentInvitationTokensRepository } from "@shared/repositories/studentInvitationTokens.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { hashToken } from "@shared/utils/token.util";
import { enforceStudentLimit } from "@shared/utils/studentLimit.util";
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
    private readonly drizzle: DrizzleProvider,
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

    await enforceStudentLimit(
      tenantId,
      this.personalsRepository,
      this.plansRepository,
      this.studentsRepository,
    );

    // CHK-010: Check if user already exists (multi-tenant student)
    const existingUser = await this.usersRepository.findByEmail(email);

    if (existingUser) {
      // User exists — verify they are a STUDENT role
      if (existingUser.role !== ApplicationRoles.STUDENT) {
        throw new BadRequestException("Email is already registered with a different role");
      }

      // Check if student already exists in this tenant
      const existingStudent = await this.studentsRepository.findByUserIdAndTenantId(existingUser.id, tenantId);
      if (existingStudent) {
        throw new BadRequestException("Student already exists in this tenant");
      }

      // CHK-019: Wrap in transaction to prevent orphan records
      await this.drizzle.db.transaction(async (tx) => {
        const student = await this.studentsRepository.create({
          userId: existingUser.id,
          tenantId,
          status: "active",
        }, tx);

        await this.coachStudentRelationsRepository.create({
          tenantId,
          studentId: student.id,
          status: "active",
          startDate: new Date(),
        }, tx);

        await this.studentInvitationTokensRepository.markAsUsed(tokenRecord.id, tx);
      });

      return { message: "Conta criada com sucesso" };
    }

    // Hash password with pepper
    const hashedPassword = await argon2.hash(data.password + env.HASH_PEPPER);

    // CHK-019: Wrap in transaction to prevent orphan records
    await this.drizzle.db.transaction(async (tx) => {
      const user = await this.usersRepository.create({
        name: data.name,
        email,
        password: hashedPassword,
        role: ApplicationRoles.STUDENT,
      }, tx);

      const student = await this.studentsRepository.create({
        userId: user.id,
        tenantId,
        status: "active",
      }, tx);

      await this.coachStudentRelationsRepository.create({
        tenantId,
        studentId: student.id,
        status: "active",
        startDate: new Date(),
      }, tx);

      await this.studentInvitationTokensRepository.markAsUsed(tokenRecord.id, tx);
    });

    return { message: "Conta criada com sucesso" };
  }
}
