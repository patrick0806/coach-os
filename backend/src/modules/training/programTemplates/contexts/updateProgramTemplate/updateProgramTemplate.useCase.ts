import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import {
  ProgramTemplatesRepository,
  ProgramTemplate,
} from "@shared/repositories/programTemplates.repository";
import { validate } from "@shared/utils/validation.util";

const updateProgramTemplateSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["active", "archived"]).optional(),
});

@Injectable()
export class UpdateProgramTemplateUseCase {
  constructor(
    private readonly programTemplatesRepository: ProgramTemplatesRepository,
  ) {}

  async execute(id: string, body: unknown, tenantId: string): Promise<ProgramTemplate> {
    const data = validate(updateProgramTemplateSchema, body);

    const existing = await this.programTemplatesRepository.findById(id, tenantId);

    if (!existing) {
      throw new NotFoundException("Program template not found");
    }

    const updated = await this.programTemplatesRepository.update(id, tenantId, data);

    if (!updated) {
      throw new NotFoundException("Program template not found");
    }

    return updated;
  }
}
