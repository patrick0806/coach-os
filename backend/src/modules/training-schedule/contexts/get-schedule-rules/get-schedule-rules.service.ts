import { Injectable, NotFoundException } from "@nestjs/common";

import { StudentsRepository } from "@shared/repositories/students.repository";
import { ScheduleRulesRepository } from "@shared/repositories/schedule-rules.repository";
import { ScheduleRule } from "@config/database/schema/schedule";
import { IAccessToken } from "@shared/interfaces";

@Injectable()
export class GetScheduleRulesService {
  constructor(
    private studentsRepository: StudentsRepository,
    private scheduleRulesRepository: ScheduleRulesRepository,
  ) {}

  async execute(studentId: string, currentUser: IAccessToken): Promise<ScheduleRule[]> {
    const personalId = currentUser.personalId as string;

    const student = await this.studentsRepository.findById(studentId, personalId);
    if (!student) {
      throw new NotFoundException("Aluno não encontrado");
    }

    return this.scheduleRulesRepository.findByStudent(studentId, personalId);
  }
}
