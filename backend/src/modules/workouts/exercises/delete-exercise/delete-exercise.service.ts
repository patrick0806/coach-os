import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";

import { ExercisesRepository } from "@shared/repositories/exercises.repository";
import { IAccessToken } from "@shared/interfaces";

@Injectable()
export class DeleteExerciseService {
  constructor(private readonly exercisesRepository: ExercisesRepository) {}

  async execute(id: string, currentUser: IAccessToken): Promise<void> {
    const exercise = await this.exercisesRepository.findOwnedById(
      id,
      currentUser.personalId as string,
    );

    if (!exercise) {
      throw new NotFoundException("Exercício não encontrado");
    }

    const inUse = await this.exercisesRepository.isInUse(id);
    if (inUse) {
      throw new ConflictException(
        "Este exercício está em uso em um plano de treino e não pode ser excluído",
      );
    }

    await this.exercisesRepository.delete(id, currentUser.personalId as string);
  }
}
