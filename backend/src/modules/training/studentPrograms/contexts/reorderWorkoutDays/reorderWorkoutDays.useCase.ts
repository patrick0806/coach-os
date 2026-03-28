import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { StudentProgramsRepository } from "@shared/repositories/studentPrograms.repository";
import { WorkoutDaysRepository } from "@shared/repositories/workoutDays.repository";
import { validate } from "@shared/utils/validation.util";

const reorderWorkoutDaysSchema = z.object({
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
export class ReorderWorkoutDaysUseCase {
  constructor(
    private readonly studentProgramsRepository: StudentProgramsRepository,
    private readonly workoutDaysRepository: WorkoutDaysRepository,
  ) {}

  async execute(
    studentProgramId: string,
    body: unknown,
    tenantId: string,
  ): Promise<void> {
    const data = validate(reorderWorkoutDaysSchema, body);

    const program = await this.studentProgramsRepository.findById(studentProgramId, tenantId);

    if (!program) {
      throw new NotFoundException("Student program not found");
    }

    await this.workoutDaysRepository.reorder(studentProgramId, data.items);
  }
}
