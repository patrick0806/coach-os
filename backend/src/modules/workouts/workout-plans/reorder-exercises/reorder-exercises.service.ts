import { Injectable, NotFoundException } from "@nestjs/common";

import { WorkoutPlansRepository } from "@shared/repositories/workout-plans.repository";
import { WorkoutExercisesRepository, WorkoutExerciseRow, ReorderItem } from "@shared/repositories/workout-exercises.repository";
import { IAccessToken } from "@shared/interfaces";

@Injectable()
export class ReorderExercisesService {
  constructor(
    private readonly workoutPlansRepository: WorkoutPlansRepository,
    private readonly workoutExercisesRepository: WorkoutExercisesRepository,
  ) {}

  async execute(
    planId: string,
    items: ReorderItem[],
    currentUser: IAccessToken,
  ): Promise<WorkoutExerciseRow[]> {
    const plan = await this.workoutPlansRepository.findById(
      planId,
      currentUser.personalId as string,
    );

    if (!plan) {
      throw new NotFoundException("Plano de treino não encontrado");
    }

    await this.workoutExercisesRepository.reorder(items);

    return this.workoutExercisesRepository.findByWorkoutPlanId(planId);
  }
}
