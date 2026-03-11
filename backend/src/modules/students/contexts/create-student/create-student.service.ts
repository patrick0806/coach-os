import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { ResendProvider } from "@shared/providers/resend.provider";
import { UsersRepository } from "@shared/repositories/users.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PasswordSetupTokensRepository } from "@shared/repositories/password-setup-tokens.repository";
import { ServicePlansRepository } from "@shared/repositories/service-plans.repository";
import { PlansRepository } from "@shared/repositories/plans.repository";
import { ApplicationRoles } from "@shared/enums";
import { IAccessToken } from "@shared/interfaces";
import { generateSetupToken, expiresInHours } from "@shared/utils";
import { env } from "@config/env";

import { CreateStudentDTO } from "./dtos/request.dto";
import { CreateStudentResponseDTO } from "./dtos/response.dto";

@Injectable()
export class CreateStudentService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly studentsRepository: StudentsRepository,
    private readonly personalsRepository: PersonalsRepository,
    private readonly passwordSetupTokensRepository: PasswordSetupTokensRepository,
    private readonly servicePlansRepository: ServicePlansRepository,
    private readonly plansRepository: PlansRepository,
    private readonly resendProvider: ResendProvider,
    private readonly drizzle: DrizzleProvider,
  ) {}

  async execute(
    dto: CreateStudentDTO,
    currentUser: IAccessToken,
  ): Promise<CreateStudentResponseDTO> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException("E-mail já está em uso");
    }

    const servicePlan = await this.servicePlansRepository.findOwnedById(
      dto.servicePlanId,
      currentUser.personalId,
    );
    if (!servicePlan) {
      throw new ConflictException("Plano de atendimento não encontrado para este personal");
    }

    const personal = await this.personalsRepository.findById(currentUser.personalId);
    const currentPlan = personal?.subscriptionPlanId
      ? await this.plansRepository.findById(personal.subscriptionPlanId)
      : null;

    if (currentPlan?.maxStudents !== null && currentPlan?.maxStudents !== undefined) {
      const activeStudents = await this.studentsRepository.countActiveByPersonal(
        currentUser.personalId,
      );

      if (activeStudents >= currentPlan.maxStudents) {
        throw new BadRequestException("Limite de alunos do plano atual atingido");
      }
    }

    const { raw, hash } = generateSetupToken();
    const expiresAt = expiresInHours(48);

    const { student, user } = await this.drizzle.db.transaction(async (tx) => {
      const user = await this.usersRepository.create(
        {
          name: dto.name,
          email: dto.email,
          password: null,
          role: ApplicationRoles.STUDENT,
        },
        tx,
      );

      const student = await this.studentsRepository.create(
        {
          userId: user.id,
          personalId: currentUser.personalId,
          servicePlanId: dto.servicePlanId,
        },
        tx,
      );

      await this.passwordSetupTokensRepository.create(
        {
          userId: user.id,
          tokenHash: hash,
          expiresAt,
        },
        tx,
      );

      return { student, user };
    });

    const [freshPersonal, personalUser] = await Promise.all([
      this.personalsRepository.findById(currentUser.personalId),
      this.usersRepository.findById(currentUser.sub),
    ]);

    const setupUrl = `${env.APP_URL}/${freshPersonal.slug}/set-password?token=${raw}`;

    await this.resendProvider.sendStudentInvite({
      to: user.email,
      studentName: user.name,
      personalName: personalUser.name,
      setupPasswordUrl: setupUrl,
    });

    return {
      studentId: student.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      personalId: student.personalId,
      servicePlanId: student.servicePlanId,
      servicePlanName: servicePlan.name,
      createdAt: student.createdAt,
    };
  }
}
