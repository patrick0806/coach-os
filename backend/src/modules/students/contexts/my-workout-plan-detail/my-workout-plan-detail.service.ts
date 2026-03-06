import { Injectable, NotFoundException } from "@nestjs/common";

import { WorkoutPlanStudentsRepository } from "@shared/repositories/workout-plan-students.repository";
import { WorkoutPlansRepository, WorkoutPlanDetail } from "@shared/repositories/workout-plans.repository";
import { IAccessToken } from "@shared/interfaces";

@Injectable()
export class MyWorkoutPlanDetailService {
  constructor(
    private readonly workoutPlanStudentsRepository: WorkoutPlanStudentsRepository,
    private readonly workoutPlansRepository: WorkoutPlansRepository,
  ) {}

  async execute(planId: string, currentUser: IAccessToken): Promise<WorkoutPlanDetail> {
    const assignment = await this.workoutPlanStudentsRepository.findAssignment(
      planId,
      currentUser.profileId,
    );

    if (!assignment) {
      throw new NotFoundException("Plano de treino não encontrado");
    }

    const plan = await this.workoutPlansRepository.findById(
      planId,
      currentUser.personalId as string,
    );

    if (!plan) {
      throw new NotFoundException("Plano de treino não encontrado");
    }

    return plan;
  }
}
