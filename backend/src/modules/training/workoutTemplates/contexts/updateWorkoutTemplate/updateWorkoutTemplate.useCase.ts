import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import {
  WorkoutTemplatesRepository,
  WorkoutTemplate,
} from "@shared/repositories/workoutTemplates.repository";
import { validate } from "@shared/utils/validation.util";

const updateWorkoutTemplateSchema = z.object({
  name: z.string().min(3).max(200).optional(),
});

@Injectable()
export class UpdateWorkoutTemplateUseCase {
  constructor(
    private readonly workoutTemplatesRepository: WorkoutTemplatesRepository,
  ) {}

  async execute(id: string, body: unknown, tenantId: string): Promise<WorkoutTemplate> {
    const data = validate(updateWorkoutTemplateSchema, body);

    const workout = await this.workoutTemplatesRepository.findByIdWithTenant(id);

    if (!workout) {
      throw new NotFoundException("Workout template not found");
    }

    if (workout.tenantId !== tenantId) {
      throw new NotFoundException("Workout template not found");
    }

    const updated = await this.workoutTemplatesRepository.update(id, data);

    if (!updated) {
      throw new NotFoundException("Workout template not found");
    }

    return updated;
  }
}
