import { Injectable } from "@nestjs/common";
import { z } from "zod";

import { StudentsRepository, StudentWithUser } from "@shared/repositories/students.repository";
import { validate } from "@shared/utils/validation.util";

const listStudentsSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(["active", "paused", "archived"]).optional(),
});

export interface ListStudentsResult {
  content: StudentWithUser[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

@Injectable()
export class ListStudentsUseCase {
  constructor(private readonly studentsRepository: StudentsRepository) {}

  async execute(query: unknown, tenantId: string): Promise<ListStudentsResult> {
    const params = validate(listStudentsSchema, query);

    const { rows, total } = await this.studentsRepository.findAllByTenantId(tenantId, {
      page: params.page,
      size: params.size,
      search: params.search,
      status: params.status,
    });

    return {
      content: rows,
      page: params.page,
      size: params.size,
      totalElements: total,
      totalPages: Math.ceil(total / params.size),
    };
  }
}
