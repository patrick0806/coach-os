import { Injectable, NotFoundException } from "@nestjs/common";

import { WorkoutSessionsRepository, WorkoutSession } from "@shared/repositories/workoutSessions.repository";

@Injectable()
export class PauseWorkoutSessionUseCase {
  constructor(
    private readonly workoutSessionsRepository: WorkoutSessionsRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<WorkoutSession> {
    const session = await this.workoutSessionsRepository.findById(id, tenantId);

    if (!session) {
      throw new NotFoundException("Workout session not found");
    }

    const updated = await this.workoutSessionsRepository.update(id, tenantId, {
      status: "paused",
    });

    if (!updated) {
      throw new NotFoundException("Workout session not found");
    }

    return updated;
  }
}
