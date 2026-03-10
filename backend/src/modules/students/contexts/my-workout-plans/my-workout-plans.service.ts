import { Injectable } from "@nestjs/common";

import { WorkoutPlanStudentsRepository } from "@shared/repositories/workout-plan-students.repository";
import { IAccessToken } from "@shared/interfaces";
import { WorkoutPlanDTO } from "@modules/workouts/workout-plans/shared/dtos/workout-plan.dto";

@Injectable()
export class MyWorkoutPlansService {
  constructor(
    private readonly workoutPlanStudentsRepository: WorkoutPlanStudentsRepository,
  ) {}

  async execute(currentUser: IAccessToken): Promise<WorkoutPlanDTO[]> {
    return this.workoutPlanStudentsRepository.findByStudentId(
      currentUser.profileId,
      currentUser.personalId as string,
    );
  }
}
