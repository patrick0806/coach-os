import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { validate } from "@shared/utils/validation.util";

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
  constructor(private readonly personalsRepository: PersonalsRepository) {}

  async execute(tenantId: string, body: unknown): Promise<void> {
    const data = validate(saveLpDraftSchema, body);

    const existing = await this.personalsRepository.findById(tenantId);
    if (!existing) {
      throw new NotFoundException("Profile not found");
    }

    await this.personalsRepository.saveLpDraft(tenantId, data);
  }
}
