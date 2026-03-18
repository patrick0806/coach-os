import { Injectable } from "@nestjs/common";

import { StudentProgramsRepository, StudentProgram } from "@shared/repositories/studentPrograms.repository";
import { Page } from "@shared/interfaces/pagenation.interface";

@Injectable()
export class GetMyProgramsUseCase {
  constructor(
    private readonly studentProgramsRepository: StudentProgramsRepository,
  ) {}

  async execute(studentId: string, tenantId: string): Promise<Page<StudentProgram>> {
    const { rows, total } = await this.studentProgramsRepository.findAllByStudentAndTenant(
      studentId,
      tenantId,
      { status: "active", page: 0, size: 50 },
    );

    return {
      content: rows,
      page: 0,
      size: 50,
      totalElements: total,
      totalPages: Math.ceil(total / 50),
    };
  }
}
