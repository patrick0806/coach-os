import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import {
  ExerciseExecutionsRepository,
  ExerciseExecution,
} from "@shared/repositories/exerciseExecutions.repository";
import { WorkoutSessionsRepository } from "@shared/repositories/workoutSessions.repository";
import { validate } from "@shared/utils/validation.util";

const createExecutionSchema = z.object({
  workoutSessionId: z.string().uuid(),
  studentExerciseId: z.string().uuid(),
  exerciseId: z.string().uuid(),
  order: z.number().int().positive().optional(),
});

@Injectable()
export class CreateExerciseExecutionUseCase {
  constructor(
    private readonly workoutSessionsRepository: WorkoutSessionsRepository,
    private readonly exerciseExecutionsRepository: ExerciseExecutionsRepository,
  ) {}

  async execute(body: unknown, tenantId: string): Promise<ExerciseExecution> {
    const data = validate(createExecutionSchema, body);

    // Validate workout session belongs to tenant
    const session = await this.workoutSessionsRepository.findById(
      data.workoutSessionId,
      tenantId,
    );
    if (!session) {
      throw new NotFoundException("Workout session not found");
    }

    // Auto-compute order if not provided
    let order = data.order;
    if (order === undefined) {
      const maxOrder = await this.exerciseExecutionsRepository.findMaxOrderBySessionId(
        data.workoutSessionId,
      );
      order = maxOrder + 1;
    }

    return this.exerciseExecutionsRepository.create({
      workoutSessionId: data.workoutSessionId,
      studentExerciseId: data.studentExerciseId,
      exerciseId: data.exerciseId,
      order,
    });
  }
}
