import { Injectable } from "@nestjs/common";

import { WorkoutPlanStudentsRepository } from "@shared/repositories/workout-plan-students.repository";
import { IAccessToken } from "@shared/interfaces";
import { WorkoutPlan } from "@config/database/schema/workout";

@Injectable()
export class MyWorkoutPlansService {
  constructor(
    private readonly workoutPlanStudentsRepository: WorkoutPlanStudentsRepository,
  ) {}

  async execute(currentUser: IAccessToken): Promise<WorkoutPlan[]> {
    return this.workoutPlanStudentsRepository.findByStudentId(
      currentUser.profileId,
      currentUser.personalId as string,
    );
  }
}
