import { Injectable, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common";
import { z } from "zod";

import {
  ExerciseSetsRepository,
  ExerciseSet,
} from "@shared/repositories/exerciseSets.repository";
import { ExerciseExecutionsRepository } from "@shared/repositories/exerciseExecutions.repository";
import { validate } from "@shared/utils/validation.util";

const recordSetSchema = z.object({
  exerciseExecutionId: z.string().uuid(),
  setNumber: z.number().int().positive(),
  plannedReps: z.number().int().positive().optional(),
  performedReps: z.number().int().min(0).optional(),
  plannedWeight: z.number().positive().optional(),
  usedWeight: z.number().min(0).optional(),
  restSeconds: z.number().int().min(0).optional(),
  completionStatus: z.enum(["completed", "partial", "skipped"]),
});

@Injectable()
export class RecordExerciseSetUseCase {
  constructor(
    private readonly exerciseExecutionsRepository: ExerciseExecutionsRepository,
    private readonly exerciseSetsRepository: ExerciseSetsRepository,
  ) {}

  async execute(body: unknown, tenantId: string): Promise<ExerciseSet> {
    const data = validate(recordSetSchema, body);

    // Validate exercise execution belongs to tenant (via join to workoutSession)
    const execution = await this.exerciseExecutionsRepository.findByIdWithTenant(
      data.exerciseExecutionId,
    );
    if (!execution) {
      throw new NotFoundException("Exercise execution not found");
    }
    if (execution.tenantId !== tenantId) {
      throw new NotFoundException("Exercise execution not found");
    }

    // CHK-027: Block recording sets on non-started sessions
    if (execution.sessionStatus !== "started") {
      throw new BadRequestException("Can only record sets on a started session");
    }

    // CHK-027: Prevent duplicate setNumber per execution
    const duplicateSet = await this.exerciseSetsRepository.existsByExecutionIdAndSetNumber(
      data.exerciseExecutionId,
      data.setNumber,
    );
    if (duplicateSet) {
      throw new ConflictException(`Set number ${data.setNumber} already exists for this execution`);
    }

    return this.exerciseSetsRepository.create({
      exerciseExecutionId: data.exerciseExecutionId,
      setNumber: data.setNumber,
      plannedReps: data.plannedReps,
      performedReps: data.performedReps,
      plannedWeight: data.plannedWeight?.toString(),
      usedWeight: data.usedWeight?.toString(),
      restSeconds: data.restSeconds,
      completionStatus: data.completionStatus,
    });
  }
}
