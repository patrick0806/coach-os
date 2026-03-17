import { Injectable, NotFoundException } from "@nestjs/common";

import { ExerciseTemplatesRepository } from "@shared/repositories/exerciseTemplates.repository";

@Injectable()
export class DeleteExerciseTemplateUseCase {
  constructor(
    private readonly exerciseTemplatesRepository: ExerciseTemplatesRepository,
  ) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const exerciseTemplate =
      await this.exerciseTemplatesRepository.findByIdWithTenant(id);

    if (!exerciseTemplate) {
      throw new NotFoundException("Exercise template not found");
    }

    if (exerciseTemplate.tenantId !== tenantId) {
      throw new NotFoundException("Exercise template not found");
    }

    await this.exerciseTemplatesRepository.delete(id);
  }
}
