import { Injectable } from "@nestjs/common";

import {
  TrainingSchedulesRepository,
  TrainingSchedule,
} from "@shared/repositories/trainingSchedules.repository";

@Injectable()
export class ListMySchedulesUseCase {
  constructor(
    private readonly trainingSchedulesRepository: TrainingSchedulesRepository,
  ) {}

  async execute(
    studentId: string,
    tenantId: string,
  ): Promise<TrainingSchedule[]> {
    return this.trainingSchedulesRepository.findByStudentId(
      studentId,
      tenantId,
      true,
    );
  }
}
