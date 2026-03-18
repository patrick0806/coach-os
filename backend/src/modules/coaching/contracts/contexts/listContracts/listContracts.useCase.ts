import { Injectable, NotFoundException } from "@nestjs/common";

import { CoachingContractsRepository, ContractWithPlan } from "@shared/repositories/coachingContracts.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";

@Injectable()
export class ListContractsUseCase {
  constructor(
    private readonly contractsRepository: CoachingContractsRepository,
    private readonly studentsRepository: StudentsRepository,
  ) {}

  async execute(studentId: string, tenantId: string): Promise<ContractWithPlan[]> {
    const student = await this.studentsRepository.findById(studentId, tenantId);
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    return this.contractsRepository.findByStudentId(studentId, tenantId);
  }
}
