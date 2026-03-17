import { Injectable, NotFoundException } from "@nestjs/common";

import {
  TrainingSchedulesRepository,
  TrainingSchedule,
} from "@shared/repositories/trainingSchedules.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";

@Injectable()
export class ListTrainingSchedulesUseCase {
  constructor(
    private readonly trainingSchedulesRepository: TrainingSchedulesRepository,
    private readonly studentsRepository: StudentsRepository,
  ) {}

  async execute(
    studentId: string,
    tenantId: string,
  ): Promise<TrainingSchedule[]> {
    const student = await this.studentsRepository.findById(studentId, tenantId);
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    return this.trainingSchedulesRepository.findByStudentId(
      studentId,
      tenantId,
      true,
    );
  }
}
