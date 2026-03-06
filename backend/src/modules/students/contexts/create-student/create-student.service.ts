import { ConflictException, Injectable } from "@nestjs/common";

import { DrizzleProvider } from "@shared/providers/drizzle.service";
import { ResendProvider } from "@shared/providers/resend.provider";
import { UsersRepository } from "@shared/repositories/users.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { PasswordSetupTokensRepository } from "@shared/repositories/password-setup-tokens.repository";
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

    const [personal, personalUser] = await Promise.all([
      this.personalsRepository.findById(currentUser.personalId),
      this.usersRepository.findById(currentUser.sub),
    ]);

    const setupUrl = `${env.APP_URL}/${personal.slug}/set-password?token=${raw}`;

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
      createdAt: student.createdAt,
    };
  }
}
