import { Injectable, NotFoundException } from "@nestjs/common";

import { WorkoutDaysRepository } from "@shared/repositories/workoutDays.repository";

@Injectable()
export class DeleteWorkoutDayUseCase {
  constructor(
    private readonly workoutDaysRepository: WorkoutDaysRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const workoutDay = await this.workoutDaysRepository.findByIdWithTenant(id);

    if (!workoutDay) {
      throw new NotFoundException("Workout day not found");
    }

    if (workoutDay.tenantId !== tenantId) {
      throw new NotFoundException("Workout day not found");
    }

    await this.workoutDaysRepository.delete(id);
  }
}
