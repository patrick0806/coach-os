import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";

import { WorkoutPlansRepository } from "@shared/repositories/workout-plans.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { WorkoutPlanStudentsRepository } from "@shared/repositories/workout-plan-students.repository";
import { IAccessToken } from "@shared/interfaces";

@Injectable()
export class AssignStudentsService {
  constructor(
    private readonly workoutPlansRepository: WorkoutPlansRepository,
    private readonly studentsRepository: StudentsRepository,
    private readonly workoutPlanStudentsRepository: WorkoutPlanStudentsRepository,
  ) {}

  async execute(
    planId: string,
    studentIds: string[],
    currentUser: IAccessToken,
  ): Promise<void> {
    const tenantId = currentUser.personalId as string;

    const plan = await this.workoutPlansRepository.findById(planId, tenantId);
    if (!plan) {
      throw new NotFoundException("Plano de treino não encontrado");
    }

    for (const studentId of studentIds) {
      const student = await this.studentsRepository.findById(studentId, tenantId);
      if (!student) {
        throw new NotFoundException(`Aluno ${studentId} não encontrado`);
      }

      const existing = await this.workoutPlanStudentsRepository.findAssignment(
        planId,
        studentId,
      );
      if (existing) {
        throw new ConflictException(
          `Aluno ${studentId} já está atribuído a este plano de treino`,
        );
      }

      await this.workoutPlanStudentsRepository.assign(planId, studentId);
    }
  }
}
