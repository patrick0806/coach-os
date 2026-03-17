import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { ProgramTemplatesRepository } from "@shared/repositories/programTemplates.repository";
import {
  WorkoutTemplatesRepository,
  WorkoutTemplate,
} from "@shared/repositories/workoutTemplates.repository";
import { validate } from "@shared/utils/validation.util";

const addWorkoutTemplateSchema = z.object({
  name: z.string().min(3).max(200),
});

@Injectable()
export class AddWorkoutTemplateUseCase {
  constructor(
    private readonly programTemplatesRepository: ProgramTemplatesRepository,
    private readonly workoutTemplatesRepository: WorkoutTemplatesRepository,
  ) {}

  async execute(
    programTemplateId: string,
    body: unknown,
    tenantId: string,
  ): Promise<WorkoutTemplate> {
    const data = validate(addWorkoutTemplateSchema, body);

    const programTemplate = await this.programTemplatesRepository.findById(
      programTemplateId,
      tenantId,
    );

    if (!programTemplate) {
      throw new NotFoundException("Program template not found");
    }

    // Calculate next order
    const maxOrder = await this.workoutTemplatesRepository.findMaxOrderByProgramTemplateId(
      programTemplateId,
    );
    const nextOrder = maxOrder + 1;

    return this.workoutTemplatesRepository.create({
      programTemplateId,
      name: data.name,
      order: nextOrder,
    });
  }
}
