import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";

import { ExercisesRepository } from "@shared/repositories/exercises.repository";
import { S3Provider } from "@shared/providers/s3.provider";

@Injectable()
export class DeleteExerciseUseCase {
  constructor(
    private readonly exercisesRepository: ExercisesRepository,
    private readonly s3Provider: S3Provider,
  ) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const exercise = await this.exercisesRepository.findById(id);

    if (!exercise) {
      throw new NotFoundException("Exercise not found");
    }

    // Cannot delete global exercises
    if (exercise.tenantId === null) {
      throw new ForbiddenException("Cannot delete a global exercise");
    }

    // Cannot delete exercises from another tenant
    if (exercise.tenantId !== tenantId) {
      throw new ForbiddenException("Cannot delete an exercise from another tenant");
    }

    try {
      await this.exercisesRepository.delete(id, tenantId);
    } catch {
      throw new ConflictException("Exercise is in use and cannot be deleted");
    }

    // Clean up S3 media after successful DB deletion
    if (exercise.mediaUrl) {
      await this.s3Provider.deleteObject(exercise.mediaUrl);
    }
  }
}
