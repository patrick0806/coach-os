import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { WorkoutSessionsRepository } from "@shared/repositories/workout-sessions.repository";
import { IAccessToken } from "@shared/interfaces";
import { WorkoutSession } from "@config/database/schema/workout";

import { UpdateStepSchema, UpdateStepInput } from "./dtos/request.dto";

@Injectable()
export class UpdateStepService {
  constructor(private readonly workoutSessionsRepository: WorkoutSessionsRepository) {}

  async execute(
    sessionId: string,
    dto: UpdateStepInput,
    currentUser: IAccessToken,
  ): Promise<WorkoutSession> {
    const parsed = UpdateStepSchema.safeParse(dto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0].message);
    }

    const session = await this.workoutSessionsRepository.findByIdAndStudent(
      sessionId,
      currentUser.profileId,
    );
    if (!session) {
      throw new NotFoundException("Sessão de treino não encontrada");
    }

    const updated = await this.workoutSessionsRepository.updateStep(
      sessionId,
      currentUser.profileId,
      parsed.data.currentStep,
    );

    return updated as WorkoutSession;
  }
}
