import { Injectable } from "@nestjs/common";

import { WorkoutPlansRepository, PaginatedWorkoutPlans } from "@shared/repositories/workout-plans.repository";
import { IAccessToken } from "@shared/interfaces";

@Injectable()
export class ListWorkoutPlansService {
  constructor(private readonly workoutPlansRepository: WorkoutPlansRepository) {}

  async execute(
    currentUser: IAccessToken,
    options: { page: number; size: number },
  ): Promise<PaginatedWorkoutPlans> {
    return this.workoutPlansRepository.findAll(currentUser.personalId as string, options);
  }
}
