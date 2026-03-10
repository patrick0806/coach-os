import { Injectable, NotFoundException } from "@nestjs/common";

import { StudentsRepository } from "@shared/repositories/students.repository";
import { WorkoutPlanStudentsRepository } from "@shared/repositories/workout-plan-students.repository";
import { IAccessToken } from "@shared/interfaces";
import { WorkoutPlanDTO } from "@modules/workouts/workout-plans/shared/dtos/workout-plan.dto";

@Injectable()
export class GetStudentWorkoutPlansService {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly workoutPlanStudentsRepository: WorkoutPlanStudentsRepository,
  ) {}

  async execute(studentId: string, currentUser: IAccessToken): Promise<WorkoutPlanDTO[]> {
    const tenantId = currentUser.personalId as string;

    const student = await this.studentsRepository.findById(studentId, tenantId);
    if (!student) {
      throw new NotFoundException("Aluno não encontrado");
    }

    return this.workoutPlanStudentsRepository.findByStudentId(studentId, tenantId);
  }
}
