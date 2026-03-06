import { Injectable, NotFoundException } from "@nestjs/common";

import { UsersRepository } from "@shared/repositories/users.repository";
import { PersonalsRepository } from "@shared/repositories/personals.repository";
import { ServicePlansRepository } from "@shared/repositories/service-plans.repository";

import {
  GetPublicProfileResponseDTO,
  ServicePlanDTO,
} from "./dtos/response.dto";

@Injectable()
export class GetPublicProfileService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly personalsRepository: PersonalsRepository,
    private readonly servicePlansRepository: ServicePlansRepository,
  ) {}

  async execute(slug: string): Promise<GetPublicProfileResponseDTO> {
    const personal = await this.personalsRepository.findBySlug(slug);

    if (!personal) {
      throw new NotFoundException("Personal não encontrado");
    }

    const [user, plans] = await Promise.all([
      this.usersRepository.findById(personal.userId),
      this.servicePlansRepository.findActiveByPersonalId(personal.id),
    ]);

    const servicePlans: ServicePlanDTO[] = plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      sessionsPerWeek: plan.sessionsPerWeek,
      durationMinutes: plan.durationMinutes,
      price: plan.price,
    }));

    return {
      id: personal.id,
      name: user.name,
      slug: personal.slug,
      bio: personal.bio,
      profilePhoto: personal.profilePhoto,
      themeColor: personal.themeColor,
      phoneNumber: personal.phoneNumber,
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
