import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { WorkoutTemplatesRepository } from "@shared/repositories/workoutTemplates.repository";
import { ExerciseTemplatesRepository } from "@shared/repositories/exerciseTemplates.repository";
import { validate } from "@shared/utils/validation.util";

const reorderExerciseTemplatesSchema = z.object({
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
export class ReorderExerciseTemplatesUseCase {
  constructor(
    private readonly workoutTemplatesRepository: WorkoutTemplatesRepository,
    private readonly exerciseTemplatesRepository: ExerciseTemplatesRepository,
  ) {}

  async execute(
    workoutTemplateId: string,
    body: unknown,
    tenantId: string,
  ): Promise<void> {
    const data = validate(reorderExerciseTemplatesSchema, body);

    const workout = await this.workoutTemplatesRepository.findByIdWithTenant(
      workoutTemplateId,
    );

    if (!workout) {
      throw new NotFoundException("Workout template not found");
    }

    if (workout.tenantId !== tenantId) {
      throw new NotFoundException("Workout template not found");
    }

    await this.exerciseTemplatesRepository.reorder(data.items);
  }
}
