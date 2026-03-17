import { Injectable, NotFoundException } from "@nestjs/common";

import { WorkoutTemplatesRepository } from "@shared/repositories/workoutTemplates.repository";

@Injectable()
export class DeleteWorkoutTemplateUseCase {
  constructor(
    private readonly workoutTemplatesRepository: WorkoutTemplatesRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const workout = await this.workoutTemplatesRepository.findByIdWithTenant(id);

    if (!workout) {
      throw new NotFoundException("Workout template not found");
    }

    if (workout.tenantId !== tenantId) {
      throw new NotFoundException("Workout template not found");
    }

    await this.workoutTemplatesRepository.delete(id);
  }
}
