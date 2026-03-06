import { Injectable, NotFoundException } from "@nestjs/common";

import { WorkoutPlansRepository } from "@shared/repositories/workout-plans.repository";
import { WorkoutPlanStudentsRepository } from "@shared/repositories/workout-plan-students.repository";
import { IAccessToken } from "@shared/interfaces";

@Injectable()
export class RevokeStudentService {
  constructor(
    private readonly workoutPlansRepository: WorkoutPlansRepository,
    private readonly workoutPlanStudentsRepository: WorkoutPlanStudentsRepository,
  ) {}

  async execute(
    planId: string,
    studentId: string,
    currentUser: IAccessToken,
  ): Promise<void> {
    const plan = await this.workoutPlansRepository.findById(
      planId,
      currentUser.personalId as string,
    );

    if (!plan) {
      throw new NotFoundException("Plano de treino não encontrado");
    }

    await this.workoutPlanStudentsRepository.revoke(planId, studentId);
  }
}
