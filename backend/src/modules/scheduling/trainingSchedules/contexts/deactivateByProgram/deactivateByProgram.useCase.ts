import { Injectable } from "@nestjs/common";

import { TrainingSchedulesRepository } from "@shared/repositories/trainingSchedules.repository";

@Injectable()
export class DeactivateByProgramUseCase {
  constructor(
    private readonly trainingSchedulesRepository: TrainingSchedulesRepository,
  ) {}

  async execute(studentProgramId: string, tenantId: string): Promise<number> {
    return this.trainingSchedulesRepository.deactivateByProgramId(
      studentProgramId,
      tenantId,
    );
  }
}
