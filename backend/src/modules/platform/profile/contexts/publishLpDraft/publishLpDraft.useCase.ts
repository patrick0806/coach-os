import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { S3Provider } from "@shared/providers/s3.provider";
import { LpFields } from "@config/database/schema/personals";
import { logger } from "@config/pino.config";

@Injectable()
export class PublishLpDraftUseCase {
  constructor(
    private readonly personalsRepository: PersonalsRepository,
    private readonly s3Provider: S3Provider,
  ) {}

  async execute(tenantId: string): Promise<void> {
    const existing = await this.personalsRepository.findById(tenantId);
    if (!existing) {
      throw new NotFoundException("Profile not found");
    }

    if (!existing.lpDraftData) {
      throw new BadRequestException("No draft to publish");
    }

    await this.personalsRepository.publishLpDraft(tenantId);

    // Best-effort S3 cleanup for live LP images replaced by draft
    const draft = existing.lpDraftData as LpFields;
    const imageFields = ["lpHeroImage", "lpImage1", "lpImage2", "lpImage3"] as const;
    for (const field of imageFields) {
      const liveUrl = existing[field];
      const draftUrl = draft[field];
      if (draftUrl !== undefined && liveUrl && draftUrl !== liveUrl) {
        try {
          await this.s3Provider.deleteObject(liveUrl);
        } catch (error) {
          logger.error({ error, field, liveUrl }, "Failed to delete old S3 LP image on publish");
        }
      }
    }
  }
}
