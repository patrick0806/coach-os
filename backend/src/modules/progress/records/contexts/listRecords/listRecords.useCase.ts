import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { ProgressRecordsRepository, ProgressRecord } from "@shared/repositories/progressRecords.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { validate } from "@shared/utils/validation.util";
import { Page } from "@shared/interfaces/pagenation.interface";

const listRecordsSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(100).default(10),
  metricType: z.string().optional(),
});

@Injectable()
export class ListProgressRecordsUseCase {
  constructor(
    private readonly progressRecordsRepository: ProgressRecordsRepository,
    private readonly studentsRepository: StudentsRepository,
  ) {}

  async execute(
    studentId: string,
    query: unknown,
    tenantId: string,
  ): Promise<Page<ProgressRecord>> {
    const params = validate(listRecordsSchema, query);

    const student = await this.studentsRepository.findById(studentId, tenantId);
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    const { rows, total } = await this.progressRecordsRepository.findAllByStudentId(
      studentId,
      tenantId,
      {
        page: params.page,
        size: params.size,
        metricType: params.metricType,
      },
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
