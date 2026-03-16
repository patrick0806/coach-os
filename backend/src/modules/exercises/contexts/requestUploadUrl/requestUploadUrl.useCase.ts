import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { ExercisesRepository } from "@shared/repositories/exercises.repository";
import { S3Provider } from "@shared/providers/s3.provider";
import { validate } from "@shared/utils/validation.util";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4"] as const;

const MIME_TYPE_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
};

const requestUploadUrlSchema = z.object({
  mimeType: z.enum(ALLOWED_MIME_TYPES),
});

export interface RequestUploadUrlResult {
  uploadUrl: string;
  fileUrl: string;
}

@Injectable()
export class RequestUploadUrlUseCase {
  constructor(
    private readonly exercisesRepository: ExercisesRepository,
    private readonly s3Provider: S3Provider,
  ) {}

  async execute(exerciseId: string, body: unknown, tenantId: string): Promise<RequestUploadUrlResult> {
    const data = validate(requestUploadUrlSchema, body);

    const exercise = await this.exercisesRepository.findById(exerciseId);

    if (!exercise) {
      throw new NotFoundException("Exercise not found");
    }

    // Cannot upload to global exercises
    if (exercise.tenantId === null) {
      throw new ForbiddenException("Cannot upload media to a global exercise");
    }

    // Cannot upload to exercises from another tenant
    if (exercise.tenantId !== tenantId) {
      throw new ForbiddenException("Cannot upload media to an exercise from another tenant");
    }

    const ext = MIME_TYPE_TO_EXT[data.mimeType];
    const timestamp = Date.now();
    const key = `exercises/${tenantId}/${exerciseId}/${timestamp}.${ext}`;

    const { uploadUrl, publicUrl } = await this.s3Provider.generatePresignedPutUrl(key, data.mimeType);

    return {
      uploadUrl,
      fileUrl: publicUrl,
    };
  }
}
