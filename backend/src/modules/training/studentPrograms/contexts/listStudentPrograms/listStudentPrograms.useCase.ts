import { Injectable } from "@nestjs/common";
import { z } from "zod";

import { StudentProgramsRepository, StudentProgram } from "@shared/repositories/studentPrograms.repository";
import { validate } from "@shared/utils/validation.util";
import { Page } from "@shared/interfaces/pagenation.interface";

const listStudentProgramsSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(["active", "finished", "cancelled"]).optional(),
});

@Injectable()
export class ListStudentProgramsUseCase {
  constructor(
    private readonly studentProgramsRepository: StudentProgramsRepository,
  ) {}

  async execute(
    studentId: string,
    query: unknown,
    tenantId: string,
  ): Promise<Page<StudentProgram>> {
    const params = validate(listStudentProgramsSchema, query);

    const { rows, total } = await this.studentProgramsRepository.findAllByStudentAndTenant(
      studentId,
      tenantId,
      {
        page: params.page,
        size: params.size,
        status: params.status,
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
