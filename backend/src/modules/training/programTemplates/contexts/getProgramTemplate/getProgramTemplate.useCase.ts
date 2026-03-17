import { Injectable, NotFoundException } from "@nestjs/common";

import {
  ProgramTemplatesRepository,
  ProgramTemplateWithTree,
} from "@shared/repositories/programTemplates.repository";

@Injectable()
export class GetProgramTemplateUseCase {
  constructor(
    private readonly programTemplatesRepository: ProgramTemplatesRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<ProgramTemplateWithTree> {
    const template = await this.programTemplatesRepository.findByIdWithTree(id, tenantId);

    if (!template) {
      throw new NotFoundException("Program template not found");
    }

    return template;
  }
}
