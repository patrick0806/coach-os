import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { Personal } from "@config/database/schema/personals";
import { validate } from "@shared/utils/validation.util";

const updateProfileSchema = z.object({
  bio: z.string().max(2000).optional(),
  phoneNumber: z.string().max(20).optional(),
  specialties: z.array(z.string()).optional(),
  themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  profilePhoto: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
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
export class UpdateProfileUseCase {
  constructor(private readonly personalsRepository: PersonalsRepository) {}

  async execute(tenantId: string, body: unknown): Promise<Personal> {
    const data = validate(updateProfileSchema, body);

    const existing = await this.personalsRepository.findById(tenantId);
    if (!existing) {
      throw new NotFoundException("Profile not found");
    }

    const updated = await this.personalsRepository.updateProfile(tenantId, data);
    return updated!;
  }
}
