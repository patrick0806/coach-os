import { Injectable } from "@nestjs/common";
import { z } from "zod";

import { ExercisesRepository, Exercise } from "@shared/repositories/exercises.repository";
import { validate } from "@shared/utils/validation.util";
import { Page } from "@shared/interfaces/pagenation.interface";

const listExercisesSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  muscleGroup: z.string().optional(),
});

@Injectable()
export class ListExercisesUseCase {
  constructor(private readonly exercisesRepository: ExercisesRepository) { }

  async execute(query: unknown, tenantId: string): Promise<Page<Exercise>> {
    const params = validate(listExercisesSchema, query);

    const { rows, total } = await this.exercisesRepository.findAllVisible(tenantId, {
      page: params.page,
      size: params.size,
      search: params.search,
      muscleGroup: params.muscleGroup,
    });

    return {
      content: rows,
      page: params.page,
      size: params.size,
      totalElements: total,
      totalPages: Math.ceil(total / params.size),
    };
  }
}
