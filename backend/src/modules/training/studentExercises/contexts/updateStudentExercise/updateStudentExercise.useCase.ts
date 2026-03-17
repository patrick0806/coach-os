import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import {
  StudentExercisesRepository,
  StudentExercise,
} from "@shared/repositories/studentExercises.repository";
import { validate } from "@shared/utils/validation.util";

const updateStudentExerciseSchema = z.object({
  sets: z.number().int().min(1).optional(),
  repetitions: z.number().int().min(0).nullable().optional(),
  plannedWeight: z.string().nullable().optional(),
  restSeconds: z.number().int().min(0).nullable().optional(),
  duration: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

@Injectable()
export class UpdateStudentExerciseUseCase {
  constructor(
    private readonly studentExercisesRepository: StudentExercisesRepository,
  ) {}

  async execute(id: string, body: unknown, tenantId: string): Promise<StudentExercise> {
    const data = validate(updateStudentExerciseSchema, body);

    const studentExercise =
      await this.studentExercisesRepository.findByIdWithTenant(id);

    if (!studentExercise) {
      throw new NotFoundException("Student exercise not found");
    }

    if (studentExercise.tenantId !== tenantId) {
      throw new NotFoundException("Student exercise not found");
    }

    const updated = await this.studentExercisesRepository.update(id, data);

    if (!updated) {
      throw new NotFoundException("Student exercise not found");
    }

    return updated;
  }
}
