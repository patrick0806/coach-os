import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { ExercisesRepository } from "@shared/repositories/exercises.repository";
import { IAccessToken } from "@shared/interfaces";

import { UpdateYoutubeUrlInput, UpdateYoutubeUrlSchema } from "./dtos/request.dto";

@Injectable()
export class UpdateYoutubeUrlService {
  constructor(private readonly exercisesRepository: ExercisesRepository) {}

  async execute(
    exerciseId: string,
    dto: UpdateYoutubeUrlInput,
    currentUser: IAccessToken,
  ): Promise<{ youtubeUrl: string | null }> {
    const parsed = UpdateYoutubeUrlSchema.safeParse(dto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0].message);
    }

    const exercise = await this.exercisesRepository.findById(exerciseId);

    if (!exercise) {
      throw new NotFoundException("Exercício não encontrado");
    }

    if (!exercise.personalId) {
      throw new ForbiddenException("Exercícios globais não podem receber link do YouTube");
    }

    if (exercise.personalId !== currentUser.personalId) {
      throw new ForbiddenException("Sem permissão para editar este exercício");
    }

    await this.exercisesRepository.updateYoutubeUrl(
      exerciseId,
      parsed.data.youtubeUrl,
    );

    return { youtubeUrl: parsed.data.youtubeUrl };
  }
}
