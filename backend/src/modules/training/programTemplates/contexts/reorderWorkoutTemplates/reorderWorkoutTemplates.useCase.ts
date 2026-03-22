import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { ProgramTemplatesRepository } from "@shared/repositories/programTemplates.repository";
import { WorkoutTemplatesRepository } from "@shared/repositories/workoutTemplates.repository";
import { validate } from "@shared/utils/validation.util";

const reorderWorkoutTemplatesSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string(),
        order: z.number().int().min(0),
      }),
    )
    .min(1),
});

@Injectable()
export class ReorderWorkoutTemplatesUseCase {
  constructor(
    private readonly programTemplatesRepository: ProgramTemplatesRepository,
    private readonly workoutTemplatesRepository: WorkoutTemplatesRepository,
  ) {}

  async execute(
    programTemplateId: string,
    body: unknown,
    tenantId: string,
  ): Promise<void> {
    const data = validate(reorderWorkoutTemplatesSchema, body);

    const programTemplate = await this.programTemplatesRepository.findById(
      programTemplateId,
      tenantId,
    );

    if (!programTemplate) {
      throw new NotFoundException("Program template not found");
    }

    await this.workoutTemplatesRepository.reorder(programTemplateId, data.items);
  }
}
