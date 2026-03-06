import { Injectable } from "@nestjs/common";

import { ExercisesRepository } from "@shared/repositories/exercises.repository";
import { IAccessToken } from "@shared/interfaces";

import { ExerciseResponseDTO } from "./dtos/response.dto";

interface ListExercisesQuery {
  muscleGroup?: string;
  search?: string;
}

@Injectable()
export class ListExercisesService {
  constructor(private readonly exercisesRepository: ExercisesRepository) {}

  async execute(
    currentUser: IAccessToken,
    query: ListExercisesQuery,
  ): Promise<ExerciseResponseDTO[]> {
    const exercises = await this.exercisesRepository.findAll(
      currentUser.personalId as string,
      query,
    );

    return exercises.map((exercise) => ({
      ...exercise,
      isGlobal: exercise.personalId === null,
    }));
  }
}
