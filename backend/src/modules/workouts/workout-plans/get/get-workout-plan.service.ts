import { Injectable, NotFoundException } from "@nestjs/common";

import { WorkoutPlansRepository, WorkoutPlanDetail } from "@shared/repositories/workout-plans.repository";
import { IAccessToken } from "@shared/interfaces";

@Injectable()
export class GetWorkoutPlanService {
  constructor(private readonly workoutPlansRepository: WorkoutPlansRepository) {}

  async execute(id: string, currentUser: IAccessToken): Promise<WorkoutPlanDetail> {
    const plan = await this.workoutPlansRepository.findById(
      id,
      currentUser.personalId as string,
    );

    if (!plan) {
      throw new NotFoundException("Plano de treino não encontrado");
    }

    return plan;
  }
}
