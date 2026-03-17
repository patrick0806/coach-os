import { Injectable, NotFoundException } from "@nestjs/common";

import {
  WorkoutSessionsRepository,
  WorkoutSessionWithExecutions,
} from "@shared/repositories/workoutSessions.repository";

@Injectable()
export class GetWorkoutSessionUseCase {
  constructor(
    private readonly workoutSessionsRepository: WorkoutSessionsRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<WorkoutSessionWithExecutions> {
    const session = await this.workoutSessionsRepository.findByIdWithExecutions(id, tenantId);

    if (!session) {
      throw new NotFoundException("Workout session not found");
    }

    return session;
  }
}
