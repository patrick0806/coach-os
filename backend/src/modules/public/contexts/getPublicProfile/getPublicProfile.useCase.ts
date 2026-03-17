import { Injectable, NotFoundException } from "@nestjs/common";

import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { ServicePlansRepository, ServicePlan } from "@shared/repositories/servicePlans.repository";

export interface PublicProfileResult {
  slug: string;
  bio: string | null;
  profilePhoto: string | null;
  specialties: string[] | null;
  phoneNumber: string | null;
  themeColor: string | null;
  lpTitle: string | null;
  lpSubtitle: string | null;
  lpHeroImage: string | null;
  lpAboutTitle: string | null;
  lpAboutText: string | null;
  lpImage1: string | null;
  lpImage2: string | null;
  lpImage3: string | null;
  servicePlans: ServicePlan[];
}

@Injectable()
export class GetPublicProfileUseCase {
  constructor(
    private readonly personalsRepository: PersonalsRepository,
    private readonly servicePlansRepository: ServicePlansRepository,
  ) {}

  async execute(slug: string): Promise<PublicProfileResult> {
    const personal = await this.personalsRepository.findBySlug(slug);

    if (!personal) {
      throw new NotFoundException("Coach not found");
    }

    const servicePlans = await this.servicePlansRepository.findActiveByTenantId(personal.id);

    return {
      slug: personal.slug,
      bio: personal.bio,
      profilePhoto: personal.profilePhoto,
      specialties: personal.specialties,
      phoneNumber: personal.phoneNumber,
      themeColor: personal.themeColor,
      lpTitle: personal.lpTitle,
      lpSubtitle: personal.lpSubtitle,
      lpHeroImage: personal.lpHeroImage,
      lpAboutTitle: personal.lpAboutTitle,
      lpAboutText: personal.lpAboutText,
      lpImage1: personal.lpImage1,
      lpImage2: personal.lpImage2,
      lpImage3: personal.lpImage3,
      servicePlans,
    };
  }
}
