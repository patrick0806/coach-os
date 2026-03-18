import { Injectable, NotFoundException } from "@nestjs/common";

import { ProgressCheckinsRepository, ProgressCheckinWithData } from "@shared/repositories/progressCheckins.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";

interface ListCheckinsParams {
  page: number;
  size: number;
}

export interface ListCheckinsResult {
  content: ProgressCheckinWithData[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

@Injectable()
export class ListCheckinsUseCase {
  constructor(
    private readonly progressCheckinsRepository: ProgressCheckinsRepository,
    private readonly studentsRepository: StudentsRepository,
  ) {}

  async execute(
    studentId: string,
    tenantId: string,
    params: ListCheckinsParams,
  ): Promise<ListCheckinsResult> {
    const student = await this.studentsRepository.findById(studentId, tenantId);
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    const { rows, total } = await this.progressCheckinsRepository.findAllByStudentId(
      studentId,
      tenantId,
      params,
    );

    return {
      content: rows,
      page: params.page,
      size: params.size,
      totalElements: total,
      totalPages: Math.ceil(total / params.size),
    };
  }
}
