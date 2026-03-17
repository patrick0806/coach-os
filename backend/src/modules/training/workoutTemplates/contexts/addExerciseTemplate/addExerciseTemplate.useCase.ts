import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import {
  WorkoutTemplatesRepository,
} from "@shared/repositories/workoutTemplates.repository";
import {
  ExerciseTemplatesRepository,
  ExerciseTemplate,
} from "@shared/repositories/exerciseTemplates.repository";
import { ExercisesRepository } from "@shared/repositories/exercises.repository";
import { validate } from "@shared/utils/validation.util";

const addExerciseTemplateSchema = z.object({
  exerciseId: z.string().min(1),
  sets: z.number().int().min(1),
  repetitions: z.number().int().min(0).optional(),
  restSeconds: z.number().int().min(0).optional(),
  duration: z.string().optional(),
  notes: z.string().optional(),
});

@Injectable()
export class AddExerciseTemplateUseCase {
  constructor(
    private readonly workoutTemplatesRepository: WorkoutTemplatesRepository,
    private readonly exerciseTemplatesRepository: ExerciseTemplatesRepository,
    private readonly exercisesRepository: ExercisesRepository,
  ) {}

  async execute(
    workoutTemplateId: string,
    body: unknown,
    tenantId: string,
  ): Promise<ExerciseTemplate> {
    const data = validate(addExerciseTemplateSchema, body);

    // Verify workout template exists and belongs to tenant
    const workout = await this.workoutTemplatesRepository.findByIdWithTenant(
      workoutTemplateId,
    );

    if (!workout) {
      throw new NotFoundException("Workout template not found");
    }

    if (workout.tenantId !== tenantId) {
      throw new NotFoundException("Workout template not found");
    }

    // Verify exercise exists and is visible to coach (global or same tenant)
    const exercise = await this.exercisesRepository.findById(data.exerciseId);

    if (!exercise) {
      throw new NotFoundException("Exercise not found");
    }

    // Exercise must be global (null tenantId) or owned by same tenant
    if (exercise.tenantId !== null && exercise.tenantId !== tenantId) {
      throw new NotFoundException("Exercise not found");
    }

    // Calculate next order
    const maxOrder =
      await this.exerciseTemplatesRepository.findMaxOrderByWorkoutTemplateId(
        workoutTemplateId,
      );
    const nextOrder = maxOrder + 1;

    return this.exerciseTemplatesRepository.create({
      workoutTemplateId,
      exerciseId: data.exerciseId,
      sets: data.sets,
      repetitions: data.repetitions,
      restSeconds: data.restSeconds,
      duration: data.duration,
      order: nextOrder,
      notes: data.notes,
    });
  }
}
