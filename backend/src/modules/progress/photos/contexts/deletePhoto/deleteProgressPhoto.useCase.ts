import { Injectable, NotFoundException } from "@nestjs/common";

import { ProgressPhotosRepository } from "@shared/repositories/progressPhotos.repository";
import { S3Provider } from "@shared/providers/s3.provider";
import { logger } from "@config/pino.config";

@Injectable()
export class DeleteProgressPhotoUseCase {
  constructor(
    private readonly progressPhotosRepository: ProgressPhotosRepository,
    private readonly s3Provider: S3Provider,
  ) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const existing = await this.progressPhotosRepository.findById(id, tenantId);
    if (!existing) {
      throw new NotFoundException("Progress photo not found");
    }

    await this.progressPhotosRepository.delete(id, tenantId);

    // Best-effort S3 cleanup — do not fail the request if S3 delete fails
    try {
      await this.s3Provider.deleteObject(existing.mediaUrl);
    } catch (error) {
      logger.error({ error, photoId: id, mediaUrl: existing.mediaUrl }, "Failed to delete S3 object for photo");
    }
  }
}
