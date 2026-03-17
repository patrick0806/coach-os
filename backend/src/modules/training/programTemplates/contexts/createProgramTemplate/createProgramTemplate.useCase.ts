import { Injectable } from "@nestjs/common";
import { z } from "zod";

import {
  ProgramTemplatesRepository,
  ProgramTemplate,
} from "@shared/repositories/programTemplates.repository";
import { validate } from "@shared/utils/validation.util";

const createProgramTemplateSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().optional(),
});

@Injectable()
export class CreateProgramTemplateUseCase {
  constructor(
    private readonly programTemplatesRepository: ProgramTemplatesRepository,
  ) {}

  async execute(body: unknown, tenantId: string): Promise<ProgramTemplate> {
    const data = validate(createProgramTemplateSchema, body);

    return this.programTemplatesRepository.create({
      tenantId,
      name: data.name,
      description: data.description,
    });
  }
}
