import { Injectable, NotFoundException } from "@nestjs/common";

import { ProgressPhotosRepository } from "@shared/repositories/progressPhotos.repository";

@Injectable()
export class DeleteProgressPhotoUseCase {
  constructor(private readonly progressPhotosRepository: ProgressPhotosRepository) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const existing = await this.progressPhotosRepository.findById(id, tenantId);
    if (!existing) {
      throw new NotFoundException("Progress photo not found");
    }

    await this.progressPhotosRepository.delete(id, tenantId);
  }
}
