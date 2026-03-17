import { Injectable, NotFoundException } from "@nestjs/common";

import { env } from "@config/env";
import { ResendProvider } from "@shared/providers/resend.provider";
import { PasswordTokensRepository } from "@shared/repositories/passwordTokens.repository";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { UsersRepository } from "@shared/repositories/users.repository";
import { generateSetupToken, expiresInHours } from "@shared/utils/token.util";

const SETUP_TOKEN_EXPIRY_HOURS = 48;

type SendMode = "email" | "link";
type SendResult = { message: string } | { accessLink: string };

@Injectable()
export class SendStudentAccessUseCase {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly personalsRepository: PersonalsRepository,
    private readonly passwordTokensRepository: PasswordTokensRepository,
    private readonly resendProvider: ResendProvider,
  ) { }

  async execute(studentId: string, tenantId: string, mode: SendMode): Promise<SendResult> {
    const student = await this.studentsRepository.findById(studentId, tenantId);
    if (!student) throw new NotFoundException("Aluno não encontrado");

    const personal = await this.personalsRepository.findById(tenantId);
    if (!personal) throw new NotFoundException("Personal não encontrado");

    // Invalidate previous setup tokens for this user and generate a new one
    await this.passwordTokensRepository.invalidateSetupTokensByUserId(student.userId);

    const { raw, hash } = generateSetupToken();
    await this.passwordTokensRepository.createSetupToken({
      userId: student.userId,
      tokenHash: hash,
      expiresAt: expiresInHours(SETUP_TOKEN_EXPIRY_HOURS),
    });

    const accessLink = `${env.APP_URL}/configurar-senha?token=${raw}`;

    if (mode === "link") {
      return { accessLink };
    }

    // Send email — resolve coach name for personalization
    const coachUser = await this.usersRepository.findById(personal.userId);
    const personalName = coachUser?.name ?? "Seu coach";

    await this.resendProvider.sendStudentInvite({
      to: student.email,
      studentName: student.name,
      personalName,
      setupPasswordUrl: accessLink,
    });

    return { message: "Link de acesso enviado com sucesso" };
  }
}
