import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { TrainingSessionsRepository } from "@shared/repositories/training-sessions.repository";
import { TrainingSession } from "@config/database/schema/schedule";
import { IAccessToken } from "@shared/interfaces";
import { ApplicationRoles } from "@shared/enums";

export interface CancelTrainingSessionInput {
  reason?: string;
}

@Injectable()
export class CancelTrainingSessionService {
  constructor(private trainingSessionsRepository: TrainingSessionsRepository) {}

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
      {
        cancelledAt: new Date(),
        cancellationReason: dto.reason ?? null,
      },
    );

    return updated!;
  }
}
