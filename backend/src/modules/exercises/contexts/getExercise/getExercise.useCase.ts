import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";

import { ExercisesRepository, Exercise } from "@shared/repositories/exercises.repository";

@Injectable()
export class GetExerciseUseCase {
  constructor(private readonly exercisesRepository: ExercisesRepository) {}

  async execute(id: string, tenantId: string): Promise<Exercise> {
    const exercise = await this.exercisesRepository.findById(id);

    if (!exercise) {
      throw new NotFoundException("Exercise not found");
    }

    // Global exercise (tenantId = null) is visible to everyone
    // Private exercise from another tenant is forbidden (do not expose its existence)
    if (exercise.tenantId !== null && exercise.tenantId !== tenantId) {
      throw new NotFoundException("Exercise not found");
    }

    return exercise;
  }
}
