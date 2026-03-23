import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { S3Provider } from "@shared/providers/s3.provider";
import { validate } from "@shared/utils/validation.util";
import { logger } from "@config/pino.config";
import { LpFields } from "@config/database/schema/personals";

const saveLpDraftSchema = z.object({
  lpLayout: z.enum(["1", "2", "3", "4"]).optional(),
  lpTitle: z.string().max(200).optional(),
  lpSubtitle: z.string().max(300).optional(),
  lpHeroImage: z.string().url().optional(),
  lpAboutTitle: z.string().max(200).optional(),
  lpAboutText: z.string().optional(),
  lpImage1: z.string().url().optional(),
  lpImage2: z.string().url().optional(),
  lpImage3: z.string().url().optional(),
});

@Injectable()
export class SaveLpDraftUseCase {
  constructor(
    private readonly personalsRepository: PersonalsRepository,
    private readonly s3Provider: S3Provider,
  ) {}

  async execute(tenantId: string, body: unknown): Promise<void> {
    const data = validate(saveLpDraftSchema, body);

    const existing = await this.personalsRepository.findById(tenantId);
    if (!existing) {
      throw new NotFoundException("Profile not found");
    }

    await this.personalsRepository.saveLpDraft(tenantId, data);

    // Best-effort S3 cleanup for replaced draft images
    const oldDraft = existing.lpDraftData as LpFields | null;
    if (oldDraft) {
      const imageFields = ["lpHeroImage", "lpImage1", "lpImage2", "lpImage3"] as const;
      for (const field of imageFields) {
        const oldUrl = oldDraft[field];
        if (field in data && oldUrl && data[field] !== oldUrl) {
          try {
            await this.s3Provider.deleteObject(oldUrl);
          } catch (error) {
            logger.error({ error, field, oldUrl }, "Failed to delete old S3 draft image");
          }
        }
      }
    }
  }
}
