import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { S3Provider } from "@shared/providers/s3.provider";
import { Personal } from "@config/database/schema/personals";
import { validate } from "@shared/utils/validation.util";
import { logger } from "@config/pino.config";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const updateProfileSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(100)
    .regex(slugRegex, "Slug must contain only lowercase letters, numbers and hyphens")
    .optional(),
  bio: z.string().max(2000).optional(),
  phoneNumber: z.string().max(20).optional(),
  specialties: z.array(z.string()).optional(),
  themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  themeColorSecondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  profilePhoto: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
});

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    private readonly personalsRepository: PersonalsRepository,
    private readonly s3Provider: S3Provider,
  ) {}

  async execute(tenantId: string, body: unknown): Promise<Personal> {
    const data = validate(updateProfileSchema, body);

    const existing = await this.personalsRepository.findById(tenantId);
    if (!existing) {
      throw new NotFoundException("Profile not found");
    }

    if (data.slug && data.slug !== existing.slug) {
      const taken = await this.personalsRepository.findBySlug(data.slug);
      if (taken && taken.id !== tenantId) {
        throw new ConflictException("This slug is already in use");
      }
    }

    const updated = await this.personalsRepository.updateProfile(tenantId, data);

    // Best-effort S3 cleanup for replaced images
    const imageFields = ["profilePhoto", "logoUrl"] as const;
    for (const field of imageFields) {
      const oldUrl = existing[field];
      if (field in data && oldUrl && data[field] !== oldUrl) {
        try {
          await this.s3Provider.deleteObject(oldUrl);
        } catch (error) {
          logger.error({ error, field, oldUrl }, "Failed to delete old S3 object on profile update");
        }
      }
    }

    return updated!;
  }
}
