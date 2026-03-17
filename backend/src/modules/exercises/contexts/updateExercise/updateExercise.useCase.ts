import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { ExercisesRepository, Exercise } from "@shared/repositories/exercises.repository";
import { S3Provider } from "@shared/providers/s3.provider";
import { validate } from "@shared/utils/validation.util";

const updateExerciseSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  muscleGroup: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  instructions: z.string().nullable().optional(),
  mediaUrl: z.string().url().nullable().optional(),
  youtubeUrl: z.string().url().nullable().optional(),
});

@Injectable()
export class UpdateExerciseUseCase {
  constructor(
    private readonly exercisesRepository: ExercisesRepository,
    private readonly s3Provider: S3Provider,
  ) {}

  async execute(id: string, body: unknown, tenantId: string): Promise<Exercise> {
    const data = validate(updateExerciseSchema, body);

    const exercise = await this.exercisesRepository.findById(id);

    if (!exercise) {
      throw new NotFoundException("Exercise not found");
    }

    // Cannot update global exercises
    if (exercise.tenantId === null) {
      throw new ForbiddenException("Cannot update a global exercise");
    }

    // Cannot update exercises from another tenant
    if (exercise.tenantId !== tenantId) {
      throw new ForbiddenException("Cannot update an exercise from another tenant");
    }

    const updated = await this.exercisesRepository.update(id, tenantId, data);

    if (!updated) {
      throw new NotFoundException("Exercise not found");
    }

    // Delete old S3 object when mediaUrl is explicitly removed or replaced
    const oldMediaUrl = exercise.mediaUrl;
    const newMediaUrl = data.mediaUrl;
    const mediaUrlChanged =
      "mediaUrl" in data &&
      oldMediaUrl !== null &&
      oldMediaUrl !== undefined &&
      newMediaUrl !== oldMediaUrl;

    if (mediaUrlChanged) {
      await this.s3Provider.deleteObject(oldMediaUrl);
    }

    return updated;
  }
}
