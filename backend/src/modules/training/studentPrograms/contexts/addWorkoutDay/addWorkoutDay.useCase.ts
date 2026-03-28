import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { StudentProgramsRepository } from "@shared/repositories/studentPrograms.repository";
import { WorkoutDaysRepository, WorkoutDay } from "@shared/repositories/workoutDays.repository";
import { validate } from "@shared/utils/validation.util";

const addWorkoutDaySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

@Injectable()
export class AddWorkoutDayUseCase {
  constructor(
    private readonly studentProgramsRepository: StudentProgramsRepository,
    private readonly workoutDaysRepository: WorkoutDaysRepository,
  ) {}

  async execute(
    studentProgramId: string,
    body: unknown,
    tenantId: string,
  ): Promise<WorkoutDay> {
    const data = validate(addWorkoutDaySchema, body);

    const program = await this.studentProgramsRepository.findById(studentProgramId, tenantId);

    if (!program) {
      throw new NotFoundException("Student program not found");
    }

    const maxOrder = await this.workoutDaysRepository.findMaxOrderByStudentProgramId(studentProgramId);
    const nextOrder = maxOrder + 1;

    return this.workoutDaysRepository.create({
      studentProgramId,
      name: data.name,
      description: data.description,
      order: nextOrder,
    });
  }
}
