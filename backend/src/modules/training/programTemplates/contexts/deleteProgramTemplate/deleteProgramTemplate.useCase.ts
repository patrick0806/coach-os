import { Injectable, NotFoundException } from "@nestjs/common";

import { ProgramTemplatesRepository } from "@shared/repositories/programTemplates.repository";

@Injectable()
export class DeleteProgramTemplateUseCase {
  constructor(
    private readonly programTemplatesRepository: ProgramTemplatesRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const existing = await this.programTemplatesRepository.findById(id, tenantId);

    if (!existing) {
      throw new NotFoundException("Program template not found");
    }

    await this.programTemplatesRepository.delete(id, tenantId);
  }
}
