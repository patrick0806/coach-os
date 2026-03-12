import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { TrainingSessionsRepository } from "@shared/repositories/training-sessions.repository";
import { TrainingSession } from "@config/database/schema/schedule";
import { IAccessToken } from "@shared/interfaces";

@Injectable()
export class CompleteTrainingSessionService {
  constructor(private trainingSessionsRepository: TrainingSessionsRepository) {}

  async execute(
    sessionId: string,
    currentUser: IAccessToken,
    workoutSessionId?: string,
  ): Promise<TrainingSession> {
    const session = await this.trainingSessionsRepository.findById(sessionId);

    if (!session || session.studentId !== currentUser.profileId) {
      throw new NotFoundException("Sessão de treino não encontrada");
    }

    if (session.sessionType === "rest") {
      throw new BadRequestException("Dias de descanso não podem ser marcados como concluídos");
    }

    if (session.status === "completed") {
      throw new BadRequestException("Esta sessão já foi concluída");
    }

    if (session.status === "cancelled") {
      throw new BadRequestException("Não é possível concluir uma sessão cancelada");
    }

    const updated = await this.trainingSessionsRepository.updateStatus(
      sessionId,
      "completed",
      session.personalId,
      { workoutSessionId: workoutSessionId ?? undefined },
    );

    return updated!;
  }
}
