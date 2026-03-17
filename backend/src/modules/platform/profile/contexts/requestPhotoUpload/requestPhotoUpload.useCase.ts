import { Injectable } from "@nestjs/common";
import { z } from "zod";

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
  constructor(private readonly s3Provider: S3Provider) {}

  async execute(tenantId: string, body: unknown): Promise<RequestPhotoUploadResult> {
    const data = validate(requestPhotoUploadSchema, body);

    const ext = MIME_TYPE_TO_EXT[data.mimeType];
    const timestamp = Date.now();
    const key = `profiles/${tenantId}/${timestamp}.${ext}`;

    const { uploadUrl, publicUrl } = await this.s3Provider.generatePresignedPutUrl(key, data.mimeType);

    return {
      uploadUrl,
      fileUrl: publicUrl,
    };
  }
}
