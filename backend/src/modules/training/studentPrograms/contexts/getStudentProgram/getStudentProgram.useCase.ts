import { Injectable, NotFoundException } from "@nestjs/common";

import {
  StudentProgramsRepository,
  StudentProgramWithTree,
} from "@shared/repositories/studentPrograms.repository";

@Injectable()
export class GetStudentProgramUseCase {
  constructor(
    private readonly studentProgramsRepository: StudentProgramsRepository,
  ) { }

  async execute(id: string, tenantId: string): Promise<StudentProgramWithTree> {
    const program = await this.studentProgramsRepository.findByIdWithTree(id, tenantId);

    if (!program) {
      throw new NotFoundException("Programa de treinamento do aluno não encontrado");
    }

    return program;
  }
}
