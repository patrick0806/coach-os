import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";

@Injectable()
export class PublishLpDraftUseCase {
  constructor(private readonly personalsRepository: PersonalsRepository) {}

  async execute(tenantId: string): Promise<void> {
    const existing = await this.personalsRepository.findById(tenantId);
    if (!existing) {
      throw new NotFoundException("Profile not found");
    }

    if (!existing.lpDraftData) {
      throw new BadRequestException("No draft to publish");
    }

    await this.personalsRepository.publishLpDraft(tenantId);
  }
}
