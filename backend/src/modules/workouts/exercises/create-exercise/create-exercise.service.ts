import { BadRequestException, Injectable } from "@nestjs/common";

import { ExercisesRepository } from "@shared/repositories/exercises.repository";
import { IAccessToken } from "@shared/interfaces";

import { CreateExerciseSchema, CreateExerciseInput } from "./dtos/request.dto";
import { ExerciseResponseDTO } from "../list-exercises/dtos/response.dto";

@Injectable()
export class CreateExerciseService {
  constructor(private readonly exercisesRepository: ExercisesRepository) {}

  async execute(
    dto: CreateExerciseInput,
    currentUser: IAccessToken,
  ): Promise<ExerciseResponseDTO> {
    const parsed = CreateExerciseSchema.safeParse(dto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0].message);
    }

    const exercise = await this.exercisesRepository.create({
      name: parsed.data.name,
      description: parsed.data.description,
      muscleGroup: parsed.data.muscleGroup,
      personalId: currentUser.personalId as string,
    });

    return { ...exercise, isGlobal: false };
  }
}
