import { Injectable, NotFoundException } from "@nestjs/common";

import { StudentsRepository } from "@shared/repositories/students.repository";
import { TrainingSessionsRepository } from "@shared/repositories/training-sessions.repository";
import { TrainingSession } from "@config/database/schema/schedule";
import { IAccessToken } from "@shared/interfaces";

export interface ListTrainingSessionsQuery {
  from: string;
  to: string;
}

@Injectable()
export class ListTrainingSessionsService {
  constructor(
    private studentsRepository: StudentsRepository,
    private trainingSessionsRepository: TrainingSessionsRepository,
  ) {}

  async execute(
    studentId: string,
    query: ListTrainingSessionsQuery,
    currentUser: IAccessToken,
  ): Promise<TrainingSession[]> {
    const personalId = currentUser.personalId as string;

    const student = await this.studentsRepository.findById(studentId, personalId);
    if (!student) {
      throw new NotFoundException("Aluno não encontrado");
    }

    return this.trainingSessionsRepository.findByStudentAndDateRange(
      studentId,
      personalId,
      query.from,
      query.to,
    );
  }
}
