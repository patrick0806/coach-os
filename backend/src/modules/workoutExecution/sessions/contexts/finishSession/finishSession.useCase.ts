import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { WorkoutSessionsRepository, WorkoutSession } from "@shared/repositories/workoutSessions.repository";

const FINISHABLE_STATUSES = ["started", "paused"];

@Injectable()
export class FinishWorkoutSessionUseCase {
  constructor(
    private readonly workoutSessionsRepository: WorkoutSessionsRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<WorkoutSession> {
    const session = await this.workoutSessionsRepository.findById(id, tenantId);

    if (!session) {
      throw new NotFoundException("Workout session not found");
    }

    if (!FINISHABLE_STATUSES.includes(session.status)) {
      throw new BadRequestException(`Cannot finish session with status "${session.status}"`);
    }

    const updated = await this.workoutSessionsRepository.update(id, tenantId, {
      status: "finished",
      finishedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException("Workout session not found");
    }

    return updated;
  }
}
