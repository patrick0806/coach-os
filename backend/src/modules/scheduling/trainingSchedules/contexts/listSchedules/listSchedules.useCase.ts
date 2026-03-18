import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";

import {
  TrainingSchedulesRepository,
  TrainingSchedule,
} from "@shared/repositories/trainingSchedules.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { ApplicationRoles } from "@shared/enums";

interface RequestingUser {
  role: ApplicationRoles;
  profileId: string;
}

@Injectable()
export class ListTrainingSchedulesUseCase {
  constructor(
    private readonly trainingSchedulesRepository: TrainingSchedulesRepository,
    private readonly studentsRepository: StudentsRepository,
  ) {}

  async execute(
    studentId: string,
    tenantId: string,
    requestingUser: RequestingUser,
  ): Promise<TrainingSchedule[]> {
    // Students can only view their own training schedules
    if (
      requestingUser.role === ApplicationRoles.STUDENT &&
      requestingUser.profileId !== studentId
    ) {
      throw new ForbiddenException(
        "Students can only view their own training schedules",
      );
    }

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
