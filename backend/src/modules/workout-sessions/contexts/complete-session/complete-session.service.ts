import { Injectable, NotFoundException } from "@nestjs/common";

import { WorkoutSessionsRepository } from "@shared/repositories/workout-sessions.repository";
import { IAccessToken } from "@shared/interfaces";
import { WorkoutSession } from "@config/database/schema/workout";

@Injectable()
export class CompleteSessionService {
  constructor(private readonly workoutSessionsRepository: WorkoutSessionsRepository) {}

  async execute(sessionId: string, currentUser: IAccessToken): Promise<WorkoutSession> {
    const session = await this.workoutSessionsRepository.findByIdAndStudent(
      sessionId,
      currentUser.profileId,
    );
    if (!session) {
      throw new NotFoundException("Sessão de treino não encontrada");
    }

    const completed = await this.workoutSessionsRepository.complete(
      sessionId,
      currentUser.profileId,
    );

    return completed as WorkoutSession;
  }
}
