import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { TrainingSessionsRepository } from "@shared/repositories/training-sessions.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { ResendProvider } from "@shared/providers/resend.provider";
import { TrainingSession } from "@config/database/schema/schedule";
import { IAccessToken } from "@shared/interfaces";
import { ApplicationRoles } from "@shared/enums";

export interface CancelTrainingSessionInput {
  reason?: string;
  notifyStudent?: boolean;
}

@Injectable()
export class CancelTrainingSessionService {
  constructor(
    private trainingSessionsRepository: TrainingSessionsRepository,
    private studentsRepository: StudentsRepository,
    private resendProvider: ResendProvider,
  ) {}

  async execute(
    sessionId: string,
    dto: CancelTrainingSessionInput,
    currentUser: IAccessToken,
  ): Promise<TrainingSession> {
    const session = await this.trainingSessionsRepository.findById(sessionId);

    if (!session) {
      throw new NotFoundException("Sessão de treino não encontrada");
    }

    // Tenant isolation — ensure the session belongs to the caller's context
    if (
      currentUser.role === ApplicationRoles.PERSONAL &&
      session.personalId !== currentUser.personalId
    ) {
      throw new NotFoundException("Sessão de treino não encontrada");
    }

    if (
      currentUser.role === ApplicationRoles.STUDENT &&
      session.studentId !== currentUser.profileId
    ) {
      throw new NotFoundException("Sessão de treino não encontrada");
    }

    if (session.status === "completed") {
      throw new BadRequestException("Não é possível cancelar um treino já concluído");
    }

    if (session.status === "cancelled") {
      throw new BadRequestException("Esta sessão já foi cancelada");
    }

    const updated = await this.trainingSessionsRepository.updateStatus(
      sessionId,
      "cancelled",
      session.personalId,
      {
        cancelledAt: new Date(),
        cancellationReason: dto.reason ?? null,
      },
    );

    // Send email notification to the student (only when a personal cancels and requests it)
    if (dto.notifyStudent && currentUser.role === ApplicationRoles.PERSONAL && currentUser.personalId) {
      const student = await this.studentsRepository.findById(session.studentId, currentUser.personalId);
      if (student) {
        this.resendProvider
          .sendSessionCancellation({
            to: student.email,
            studentName: student.name,
            scheduledDate: session.scheduledDate,
            reason: dto.reason,
          })
          .catch(() => {});
      }
    }

    return updated!;
  }
}
