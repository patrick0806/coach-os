import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { ProgressPhotosRepository, ProgressPhoto } from "@shared/repositories/progressPhotos.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";
import { validate } from "@shared/utils/validation.util";
import { Page } from "@shared/interfaces/pagenation.interface";

const listPhotosSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(100).default(10),
});

@Injectable()
export class ListProgressPhotosUseCase {
  constructor(
    private readonly progressPhotosRepository: ProgressPhotosRepository,
    private readonly studentsRepository: StudentsRepository,
  ) {}

  async execute(
    studentId: string,
    query: unknown,
    tenantId: string,
  ): Promise<Page<ProgressPhoto>> {
    const params = validate(listPhotosSchema, query);

    const student = await this.studentsRepository.findById(studentId, tenantId);
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    const { rows, total } = await this.progressPhotosRepository.findAllByStudentId(
      studentId,
      tenantId,
      {
        page: params.page,
        size: params.size,
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
