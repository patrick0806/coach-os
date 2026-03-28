import { Injectable, NotFoundException } from "@nestjs/common";

import { StudentExercisesRepository } from "@shared/repositories/studentExercises.repository";

@Injectable()
export class DeleteStudentExerciseUseCase {
  constructor(
    private readonly studentExercisesRepository: StudentExercisesRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const studentExercise = await this.studentExercisesRepository.findByIdWithTenant(id);

    if (!studentExercise) {
      throw new NotFoundException("Student exercise not found");
    }

    if (studentExercise.tenantId !== tenantId) {
      throw new NotFoundException("Student exercise not found");
    }

    await this.studentExercisesRepository.delete(id);
  }
}
