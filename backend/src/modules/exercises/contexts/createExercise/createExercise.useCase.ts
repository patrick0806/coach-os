import { Injectable } from "@nestjs/common";
import { z } from "zod";

import { ExercisesRepository, Exercise } from "@shared/repositories/exercises.repository";
import { validate } from "@shared/utils/validation.util";

const createExerciseSchema = z.object({
  name: z.string().min(3).max(200),
  muscleGroup: z.string().min(1).max(100),
  description: z.string().optional(),
  instructions: z.string().optional(),
  youtubeUrl: z.string().url().optional(),
});

@Injectable()
export class CreateExerciseUseCase {
  constructor(private readonly exercisesRepository: ExercisesRepository) {}

  async execute(body: unknown, tenantId: string): Promise<Exercise> {
    const data = validate(createExerciseSchema, body);

    return this.exercisesRepository.create({
      name: data.name,
      muscleGroup: data.muscleGroup,
      tenantId,
      description: data.description,
      instructions: data.instructions,
      youtubeUrl: data.youtubeUrl,
    });
  }
}
