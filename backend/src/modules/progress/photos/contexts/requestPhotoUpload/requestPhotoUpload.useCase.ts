import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { StudentsRepository } from "@shared/repositories/students.repository";
import { S3Provider } from "@shared/providers/s3.provider";
import { validate } from "@shared/utils/validation.util";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const MIME_TYPE_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const requestPhotoUploadSchema = z.object({
  mimeType: z.enum(ALLOWED_MIME_TYPES),
});

export interface RequestPhotoUploadResult {
  uploadUrl: string;
  fileUrl: string;
}

@Injectable()
export class RequestPhotoUploadUseCase {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly s3Provider: S3Provider,
  ) {}

  async execute(
    studentId: string,
    body: unknown,
    tenantId: string,
  ): Promise<RequestPhotoUploadResult> {
    const data = validate(requestPhotoUploadSchema, body);

    const student = await this.studentsRepository.findById(studentId, tenantId);
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    const ext = MIME_TYPE_TO_EXT[data.mimeType];
    const timestamp = Date.now();
    const key = `progress-photos/${tenantId}/${studentId}/${timestamp}.${ext}`;

    const { uploadUrl, publicUrl } = await this.s3Provider.generatePresignedPutUrl(
      key,
      data.mimeType,
    );

    return {
      uploadUrl,
      fileUrl: publicUrl,
    };
  }
}
