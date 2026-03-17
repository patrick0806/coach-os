import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import {
  ExerciseTemplatesRepository,
  ExerciseTemplate,
} from "@shared/repositories/exerciseTemplates.repository";
import { validate } from "@shared/utils/validation.util";

const updateExerciseTemplateSchema = z.object({
  sets: z.number().int().min(1).optional(),
  repetitions: z.number().int().min(0).nullable().optional(),
  restSeconds: z.number().int().min(0).nullable().optional(),
  duration: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

@Injectable()
export class UpdateExerciseTemplateUseCase {
  constructor(
    private readonly exerciseTemplatesRepository: ExerciseTemplatesRepository,
  ) {}

  async execute(
    id: string,
    body: unknown,
    tenantId: string,
  ): Promise<ExerciseTemplate> {
    const data = validate(updateExerciseTemplateSchema, body);

    const exerciseTemplate =
      await this.exerciseTemplatesRepository.findByIdWithTenant(id);

    if (!exerciseTemplate) {
      throw new NotFoundException("Exercise template not found");
    }

    if (exerciseTemplate.tenantId !== tenantId) {
      throw new NotFoundException("Exercise template not found");
    }

    const updated = await this.exerciseTemplatesRepository.update(id, data);

    if (!updated) {
      throw new NotFoundException("Exercise template not found");
    }

    return updated;
  }
}
