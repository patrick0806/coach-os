import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { WorkoutDaysRepository } from "@shared/repositories/workoutDays.repository";
import { StudentExercisesRepository } from "@shared/repositories/studentExercises.repository";
import { validate } from "@shared/utils/validation.util";

const reorderStudentExercisesSchema = z.object({
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
export class ReorderStudentExercisesUseCase {
  constructor(
    private readonly workoutDaysRepository: WorkoutDaysRepository,
    private readonly studentExercisesRepository: StudentExercisesRepository,
  ) {}

  async execute(
    workoutDayId: string,
    body: unknown,
    tenantId: string,
  ): Promise<void> {
    const data = validate(reorderStudentExercisesSchema, body);

    const workoutDay = await this.workoutDaysRepository.findByIdWithTenant(workoutDayId);

    if (!workoutDay) {
      throw new NotFoundException("Workout day not found");
    }

    if (workoutDay.tenantId !== tenantId) {
      throw new NotFoundException("Workout day not found");
    }

    await this.studentExercisesRepository.reorder(workoutDayId, data.items);
  }
}
