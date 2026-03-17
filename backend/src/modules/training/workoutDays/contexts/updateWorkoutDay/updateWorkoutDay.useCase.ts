import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import {
  WorkoutDaysRepository,
  WorkoutDay,
} from "@shared/repositories/workoutDays.repository";
import { validate } from "@shared/utils/validation.util";

const updateWorkoutDaySchema = z.object({
  name: z.string().min(3).max(200).optional(),
  description: z.string().nullable().optional(),
  order: z.number().int().min(0).optional(),
});

@Injectable()
export class UpdateWorkoutDayUseCase {
  constructor(private readonly workoutDaysRepository: WorkoutDaysRepository) {}

  async execute(id: string, body: unknown, tenantId: string): Promise<WorkoutDay> {
    const data = validate(updateWorkoutDaySchema, body);

    const workoutDay = await this.workoutDaysRepository.findByIdWithTenant(id);

    if (!workoutDay) {
      throw new NotFoundException("Workout day not found");
    }

    if (workoutDay.tenantId !== tenantId) {
      throw new NotFoundException("Workout day not found");
    }

    const updated = await this.workoutDaysRepository.update(id, data);

    if (!updated) {
      throw new NotFoundException("Workout day not found");
    }

    return updated;
  }
}
