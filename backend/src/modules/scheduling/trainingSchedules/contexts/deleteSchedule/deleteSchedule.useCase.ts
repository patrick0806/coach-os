import { Injectable, NotFoundException } from "@nestjs/common";

import { TrainingSchedulesRepository } from "@shared/repositories/trainingSchedules.repository";

@Injectable()
export class DeleteTrainingScheduleUseCase {
  constructor(
    private readonly trainingSchedulesRepository: TrainingSchedulesRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const existing = await this.trainingSchedulesRepository.findById(
      id,
      tenantId,
    );
    if (!existing) {
      throw new NotFoundException("Training schedule not found");
    }

    await this.trainingSchedulesRepository.delete(id, tenantId);
  }
}
