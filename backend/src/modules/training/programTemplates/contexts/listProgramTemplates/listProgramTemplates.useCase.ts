import { Injectable } from "@nestjs/common";
import { z } from "zod";

import {
  ProgramTemplatesRepository,
  ProgramTemplate,
} from "@shared/repositories/programTemplates.repository";
import { validate } from "@shared/utils/validation.util";
import { Page } from "@shared/interfaces/pagenation.interface";

const listProgramTemplatesSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(["active", "archived"]).optional(),
});

@Injectable()
export class ListProgramTemplatesUseCase {
  constructor(
    private readonly programTemplatesRepository: ProgramTemplatesRepository,
  ) {}

  async execute(query: unknown, tenantId: string): Promise<Page<ProgramTemplate>> {
    const params = validate(listProgramTemplatesSchema, query);

    const { rows, total } = await this.programTemplatesRepository.findAllByTenantId(
      tenantId,
      {
        page: params.page,
        size: params.size,
        search: params.search,
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
