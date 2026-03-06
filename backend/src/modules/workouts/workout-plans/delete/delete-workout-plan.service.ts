import { Injectable, NotFoundException } from "@nestjs/common";

import { WorkoutPlansRepository } from "@shared/repositories/workout-plans.repository";
import { IAccessToken } from "@shared/interfaces";

@Injectable()
export class DeleteWorkoutPlanService {
  constructor(private readonly workoutPlansRepository: WorkoutPlansRepository) {}

  async execute(id: string, currentUser: IAccessToken): Promise<void> {
    const plan = await this.workoutPlansRepository.findById(
      id,
      currentUser.personalId as string,
    );

    if (!plan) {
      throw new NotFoundException("Plano de treino não encontrado");
    }

    await this.workoutPlansRepository.delete(id, currentUser.personalId as string);
  }
}
